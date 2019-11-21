'use strict';

/**
*  COMM is for sending COMMunications
*
*  - Supports plug-in transports
*  - Chooses which transports users get messages
*                                                                            */
function Comm(cfg) {
  const noop = (()=>{}) 
  let mode = cfg.comm.mode||'live'
  let transports = cfg.comm.transports||[]
  
  this.transports = {}
  if (transports.includes('ses'))
    this.transports.ses = require('./ses')((cfg.wrappers||{}).ses, {mode})

  if (transports.includes('smtp'))
    this.transports.smtp = require('./smtp')((cfg.wrappers||{}).smtp, {mode})

  this.add = (name) => {
    let transport = Wrappers[name]
    if (!transport) throw Error(`Transport ${name} not inistantiated as Wrappers.${name}`)
    if (!transport.sendUser) throw Error(`Transport[${name}].sendUser undefined`)
    if (!transport.sendGroup) throw Error(`Transport[${name}].sendGroup undefined`)
    this.transports[name] = transport
  }
  

  var _send = fn => to => ({
    by: (transports, opts={}) => ({
      send: (key, data, cb) => {
        var use = []
        for (var t in transports)
          if (!opts[t] || opts[t](to)) use.push(t)

        return Promise.all(use.map(
          by => {
            var parts = honey.templates.get(`${key}:${by}`)
            var _id = honey.logic.DRY.id.new() // message _id

            return new Promise((resolve, reject) => {
              var first = to.name.split(' ')[0]
              var tmplData = assign({_id,to:assign({first},to)}, data)
              var msg = honey.templates.renderParts(parts, tmplData)

              this.transports[by][fn](to, msg, opts,
                (e, r) => e ? reject(e) : resolve(r))
            })
            .then(r => {
              assign(r, { _id, key:`${key}:${by}`, to })
              if (cb) cb(null, r)
                return r
              })
            .catch(e => {
              console.log(`${key}:${by}. `, e)
              LOG('comm.err', `${key}:${by} error`, `${e}`)
              if (cb) cb(e, {data, key:`${key}:${by}`, to})
            })
          })
        )
      }})
    })

  // return msgBuilder
  this.toGroup = _send('sendGroup')
  this.toUser = _send('sendUser')
  this.toUsers = (users, done) => ({
    by: (transports, opts={}) => ({
      send: (key, data) =>
        Promise.all(users.map(u =>
          _send('sendUser')(u).by(transports, opts).send(key, data, opts.cb)
        ))
          .then(r => {
            r = _.flatten(r)
            if (done) done(null, r)
            return r
          }).catch(e => done ? done(e) : 0)
    })
  })


  let {errors} = cfg.log
  if (errors.mail) {
    let group = errors.mail.to.split(',')

    this.error = function(e, opts, cb) {
      if (cb == null && opts.constructor == Function) {
        cb = opts
        opts = {}
      }
      let parts = { text: honey.log.issue, subject: ({e}) => `${e.message}` }
      let data = assign({e},opts)
      let mail = honey.templates.renderParts(parts, data)
      
      if (opts.subject) mail.subject = opts.subject
      let sender = opts.sender || errors.mail.sender
      this.transports.ses.sendGroup(group, mail, {sender}, cb)
    }
  }

  return this
}


module.exports = Comm

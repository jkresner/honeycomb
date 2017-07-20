'use strict';

/**                                                                   
*  COMM is for sending COMMunications
* 
*  - Supports plug-in transports
*  - Chooses which transports users get messages
*                                                                            */     
module.exports = function(config) {

  var comm = { transports: {} }
  
  if (config.wrappers.ses)
    comm.transports.ses = require('./ses')(config)
  
  if (config.wrappers.smtp)
    comm.transports.smtp = require('./smtp')(config)

  comm.add = function(name) {
    var transport = Wrappers[name]
    if (!transport) throw Error(`Transport ${name} not inistantiated as Wrappers.${name}`)
    if (!transport.sendUser) throw Error(`Transport[${name}].sendUser undefined`)
    if (!transport.sendGroup) throw Error(`Transport[${name}].sendGroup undefined`)
    comm.transports[name] = transport
  }

  var noop = (()=>{})

  var _send = fn => to => ({ 
    by: (transports, opts={}) => ({      
      send: (key, data, cb) => {
        var use = []
        for (var t in transports)
          if (!opts[t] || opts[t](to)) use.push(t) 
        
        return Promise.all(use.map(
          (transport) => {
            var parts = honey.templates.get(`${key}:${transport}`)      
            // OI('send', transport, key, data, to, parts)
            return new Promise(function(resolve, reject) {
              var msg = honey.templates.renderParts(parts, assign(data,{to}))
              // OI('send.msg'.green, msg)
              comm.transports[transport][fn](to, msg, opts, 
                (e, r) => e ? reject(e) : resolve(r))
            })
            .then(r => assign(r,{by:transport}))
            .catch(e => {
              console.log(`${transport}._send`, e)
              LOG('comm.err', `${transport} error`, `${e}`)
              if (cb) cb(e)
            })
          })
        )
      }})
    })
      
  // return msgBuilder
  comm.toGroup = _send('sendGroup')
  comm.toUser = _send('sendUser')
  comm.toUsers = (users, cb) => ({
    by: (transports, opts={}) => ({
      send: (key, data) => 
        Promise.all(
          users.map(u =>_send('sendUser')(u).by(transports, opts).send(key,data))        
        ).then(r => _.flatten(r))           
         .catch(e => cb ? cb(e) : 0)
    })
  })
    

  var {errors} = config.log
  if (errors.mail) {
    var group = errors.mail.to.split(',')
     
    comm.error = function(e, opts, cb) {      
      if (cb == null && opts.constructor == Function) {
        cb = opts
        opts = {}
      }
      var parts = { text: honey.log.issue, subject: ({e}) => `${e.message}` }
      var data = assign({e},opts)
      var mail = honey.templates.renderParts(parts, data)
      mail.html = honey.templates.markIt(mail.text)
      if (opts.subject) mail.subject = opts.subject
      var sender = opts.sender || errors.mail.sender
      this.transports.ses.sendGroup(group, mail, {sender}, cb)
    }
  }
  
  return comm
}

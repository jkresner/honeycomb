'use strict';


function reqErrorTxt(e, req, stackFilter)
{
  var txt = `No request context`

  if (req) {
    var {user,ctx} = req
    var ref = (ctx||{}).ref || req.header('Referer')
    var sId = (ctx||{}).sId || req.sessionID
    var ua = (ctx||{}).ua || req.header('user-agent')
    var ud = (ctx||{}).ud ? `\nud:  ${ctx.ud}` : ''
    var usr = user ? `\n_id: ObjectId("${user._id}") ${user.name} ${user.email||user.username||''}` : ''
    var body = !/get|delete/i.test(req.method) && req.body ? `\n\n${JSON.stringify(req.body)}` : ''
    var url = req.originalUrl.indexOf("http") == 0 ? req.originalUrl : config.http.host+req.originalUrl

    txt = `
${req.method} ${url}${ref ? '\n << '+ref:''}

${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
sid: ${sId}
ua:  ${ua||'null'}${ud}${usr}${body}`
  }

  var stack = e.stack || ''
  if (stackFilter) stack = stack.split('\n').filter(ln => !stackFilter.test(ln)).join('\n')

  return `${e.message||e}\n${txt}\n\n${stack}\n\n${moment()}\n${(req||{}).hostname||''}`
}




class Dispatch {

  constructor(config) {

    var cfg = config.comm
    for (var t of cfg.dispatch.transports)
      this[t] = Wrappers[t]

    this.formatters = {}

    this.senders = {}
    for (var s in cfg.senders)
      this.senders[s] = cfg.senders[s]

    var errors = cfg.dispatch.groups['error'+'s']
    var eSkip = (errors||{}).skip ? new RegExp(errors.skip) : false
    
    var ses = this['ses']
    this.error = function(e, data, done) {
      if (!errors) return
      if (eSkip && eSkip.test(`${e.message||e}`)) return

      var stackFilter = new RegExp(process.env.INSTRUMENT_FILTER||'test')
      var subject = data.subject || `{${cfg.senders['err'].app}} ${e.message}`
      var text = data.text || reqErrorTxt(e, data.req, stackFilter)
      var sender = cfg.senders['err']
      ses.sendGroup('errors', {text,subject}, {sender}, done)
    }

  }

  resolveFrom(sender, transports) {
    var s = null
    if (sender.constructor != String)
      s = sender
    else {
      if (!this.senders[sender]) throw Error(`Sender ${sender} not defined in config`)
      s = this.senders[sender]
    }
    //-- TODO check sender has details for transports
    return s
  }

  toUser(user, msg, opts, done) {
    for (var transport of opts.transports)
      this[transport].sendUser(user, msg, opts, done)
  }

  //-- Assume all templates and groups are available in cache
  toGroup(group, msg, opts, done) {
    for (var transport of opts.transports)
      this[transport].sendGroup(group, msg, opts, done)
  }

  log() {
    console.log.apply(null, arguments)
  }

}


function msgBuilder(transport) {

  //-- Next iteration to support multiple transports at at time
  var opts = { transports: [transport] }
  var formatters = {}

  //-- Should only pass done for single user 'to'
  function send(to, done) {
    if (to.constructor !== Array) to = [to]

    var sent = []
    var cb = !done ? null : ((e,r) => {
      sent.push(e||r)
      if (sent.length == to.length)
        done(null, to.length == 1 ? sent[0] : sent)
    })

    for (var user of to) {
      var msg = opts.raw ||
                Composer.render(Object.assign({to:user},opts))
      dispatch.toUser(user, msg, opts, cb)
    }
  }

  function sendGroup(group, done) {
    if (!opts.raw) throw Error("Only raw messages for groups atm")
    dispatch.toGroup(group, opts.raw, opts, done)
  }

  function raw(raw) {
    opts.raw = raw
    return {send,sendGroup}
  }

  function tmpl(name, data) {
    opts.template = Composer.getCompiledTemplate(transport, name)
    opts.data = data
    return {send,sendGroup}
  }

  return {
    error: dispatch.error,
    from(sender) {
      opts.sender = dispatch.resolveFrom(sender, [transport])
      return {raw,tmpl}
    }
  }

}


var dispatch;
module.exports = function(config) {
  require('./comm.transports').init(config)
  dispatch = new Dispatch(config)
  msgBuilder.log = dispatch.log

  return msgBuilder
}

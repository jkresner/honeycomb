var {createTransport}    = require('nodemailer')
var noop = e => e ? console.log('smtp.error'.red, e) : 0
var address = mail =>
  mail instanceof Object ? `${mail.name} <${mail.email}>` : mail

function send(api, mail, opts, cb)
{
  cb = cb || noop
  if (opts.sender)
    mail.from = address(opts.sender)

  api.sendMail(mail, (e, info) => {
    if (e) return cb(e)
    LOG('comm.send', `SMTP send`, `${mail.from} >> ${mail.to.join(',')}`)
    LOG('comm.mail', 'MAIL', `${info.messageId}\n--- ${mail.subject}\n`+mail.text.dim+'\n---')
    mail.messageId = info.messageId
    mail.messageTo = mail.to.join(',')
    cb(e, mail)
  })
}


var smtpWrapper = {

  name: 'smtp',

  init(cfg, ops) {
    let mode = ops.mode || 'live'

    if (mode == 'stub')
      this.api = createTransport(require('nodemailer-stub-transport')())
    else
      this.api = createTransport(cfg)

    LOG('comm.init', `SMTP init (${mode})`)
  },

  sendUser(user, mail, opts, cb) {
    mail.to = [address(user)]
    send(this.api, mail, opts, cb)
  },

  sendGroup(group, mail, opts, cb) {
    mail.to = group.map(usr=>address(usr))
    send(this.api, mail, opts, cb)
  }
}


module.exports = function(cfg) {
  Wrappers.smtp = smtpWrapper
  Wrappers.smtp.init(cfg.wrappers.smtp, cfg.comm)
  return Wrappers.smtp
}

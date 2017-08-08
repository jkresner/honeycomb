var {createTransport}    = require('nodemailer')
var mode = 'live'
var noop = e => e ? console.log('ses.error'.red, e) : 0
var address = mail => 
  mail instanceof Object ? `${mail.name} <${mail.email}>` : mail


function send(api, mail, opts, cb)
{
  cb = cb || noop
  if (opts.sender)
    mail.from = address(opts.sender)

  api.sendMail(mail, function(e, info) { 
    if (e) return cb(e)
    LOG('comm.send', `SES send ${mode=='stub'?'(stub)':''}`, `${mail.from} >> ${mail.to.join(',')}`, info.messageId)
    LOG('comm.mail', 'MAIL', `\n--- ${mail.subject}\n`+mail.text.dim+'\n---')
    mail.messageId = info.messageId
    mail.messageTo = mail.to.join(',')
    cb(e, mail)
  })
}


var sesWrapper = {

  name:  'ses',

  init(config) {
    var defaults  = { apiVersion: '2010-12-01', region: "us-east-1" }
    
    mode = config.comm.mode
    if (mode == 'stub')
      this.api = createTransport(require('nodemailer-stub-transport')())
    else 
    {
      var ses = require('aws-sdk/clients/ses')
      var SES = new ses(assign(defaults, config.wrappers.ses))  
      this.api = createTransport({SES})
    }

    LOG('comm.init', `SES  init (${config.comm.mode})`)
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


module.exports = function(config) {
  Wrappers.ses = sesWrapper
  Wrappers.ses.init(config)
  return Wrappers.ses
}
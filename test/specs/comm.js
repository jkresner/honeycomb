module.exports = () =>

  before(function() {
    var conf = {
      log: {
        appKey:     'APPTESTK',
        errors: {
          mail: {   to: "jk <jk@air.test>,abc <sbc@test.com>",
                    sender: "ERR <team@test.com>" }
        }
      },
      comm: {
        mode:       'stub',
        transports: ['ses','smtp'],
        sender: {
          noreply:  { mail: "Honey <noreply@honey.stub>" }
        }
      },
      templates: {
        dirs:       {},
        engines:    'hbs,marked' },
      wrappers: {
        ses: {
          accessKeyId: "--",
          secretAccessKey: "--" },
        smtp: { 
          "service": "--", 
          "auth": { "user": "--", "pass": "--" } 
        }
      }
    }

    honey.log = { issue: data => `${data.e.message} **bold**` }
    honey.templates = require('../../lib/app/templates')(null, conf)
    
    global.COMM = require('../../lib/comm/index')(conf)

    global.Wrappers.pushr = {
      api: { send(msg, cb) { cb(null, msg) } },
      sendGroup(to, msg, opts, cb) {},
      sendUser(to, msg, opts, cb) {
        this.api.send(assign(msg,{token:to.push}), cb)
      }
    }
    
    COMM.add('pushr')
  })

  after(function() {
    delete global.cache
    delete global.config
    delete global.COMM
    delete global.honey.log
    delete global.honey.templates   
  })

    
  DESCRIBE("error", require('./comm/error'))
  DESCRIBE("sendUser", require('./comm/toUser'))
  DESCRIBE("sendUsers", require('./comm/toUsers'))

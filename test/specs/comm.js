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

    STUB.globals({
      honey: {
        log: { issue: data => `${data.e.message} **bold**` },
        logic: { DRY: { id: { new: x => global.ObjectId() } } },
        templates: require('../../lib/app/templates')(null, conf),
      },
      COMM: require('../../lib/comm/index')(conf),
      Wrappers: assign({ pushr: {
        api: { send(msg, cb) { cb(null, msg) } },
        sendGroup(to, msg, opts, cb) {},
        sendUser(to, msg, opts, cb) {
          this.api.send(assign(msg,{token:to.push}), cb)
        }}}, global.Wrappers)
    })

    COMM.add('pushr')
  })

  after(function() {
    STUB.restore.globals()
  })


  DESCRIBE("error", require('./comm/error'))
  DESCRIBE("sendUser", require('./comm/toUser'))
  DESCRIBE("sendUsers", require('./comm/toUsers'))

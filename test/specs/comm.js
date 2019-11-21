module.exports = () =>

  before(function() {
    let Comm = require('../../lib/comm/index')

    let {log,comm,templates,wrappers} = OPTS.stubConfig
    let cfg = {log,comm,templates,wrappers}

    STUB.globals({
      honey: {
        log: { issue: data => `${data.e.message} **bold**` },
        logic: { DRY: { id: { new: x => global.ObjectId() } } },
        templates: require('../../lib/app/templates')(null, cfg),
      },
      LOG: () => {},
      COMM: new Comm(cfg),
      Wrappers: assign({ pushr: {
        api: { 
          send(msg, cb) { cb(null, msg) } },
          sendGroup(to, msg, opts, cb) {},
          sendUser(to, msg, opts, cb) {
            this.api.send(assign(msg,{token:to.push}), cb)
          }
        }}, global.Wrappers)
    })

    COMM.add('pushr')
  })

  after(function() {
    STUB.restore.globals()
  })


  DESCRIBE("error", require('./comm/error'))
  DESCRIBE("sendUser", require('./comm/toUser'))
  DESCRIBE("sendUsers", require('./comm/toUsers'))

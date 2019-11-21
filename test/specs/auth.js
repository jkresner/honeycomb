module.exports = () =>

  before(done => {
    let Comm = require('../../lib/comm/index')

    let {log,comm,templates,wrappers} = OPTS.stubConfig
    let cfg = {log,comm,templates,wrappers}

    STUB.globals({
      COMM: new Comm(cfg),
      CAL: { templates: {} }
    })

    DB.ensureDocs('User', Object.values(FIXTURE.users), (e,r) => done())
  })

  after(function() {
    STUB.restore.globals()
  })

  DESCRIBE("signup", require('./auth/signup'))
  DESCRIBE("login", require('./auth/login'))
  DESCRIBE("link", require('./auth/link'))
  DESCRIBE("user", require('./auth/user'))

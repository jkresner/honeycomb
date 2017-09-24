module.exports = () =>

  before(done =>
    DB.ensureDocs('User', [FIXTURE.users["mwauthd"]], r => done())
  )

  // after(function() {
    // STUB.restore.globals()
  // })

  DESCRIBE("authd",       require('./mw/authd'))
  DESCRIBE("notfound",    require('./mw/notfound'))

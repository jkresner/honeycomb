module.exports = () => {


  before(done => {
    DB.ensureDocs('User', [FIXTURE.users["mwauthd"]], r => done())
  })


  // it("Lazy loads")
  // IT.skip("Trace", () => {})
  // it("Trace w middleware data")


  DESCRIBE("mw.forbid",      () => require('./mw/forbid'))
  DESCRIBE("mw.notfound",          require('./mw/notfound'))
  // DESCRIBE("mw.error",             require('./mw/error'))
  // DESCRIBE("mw.wrap",        () => require('./mw/wrap'))


}

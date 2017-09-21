module.exports = () =>


  before(done =>
    DB.ensureDocs('User', Object.values(FIXTURE.users), (e,r) => done())
  )


  DESCRIBE("signup", require('./auth/signup'))
  DESCRIBE("login", require('./auth/login'))
  DESCRIBE("link", require('./auth/link'))
  DESCRIBE("log", require('./auth/log'))
  DESCRIBE("user", require('./auth/user'))


  /*DESCRIBE("Org", function() {
    it "Fail signup without corporate email/domain"

  }) -- one day! */

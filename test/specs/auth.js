module.exports = () =>

  DESCRIBE("signup", require('./auth/signup'))
  DESCRIBE("login", require('./auth/login'))
  DESCRIBE("link", require('./auth/link'))
  DESCRIBE("pages", require('./auth/pages'))
  DESCRIBE("emails", require('./auth/emails'))

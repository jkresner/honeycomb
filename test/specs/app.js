module.exports = () =>

  DESCRIBE("api", require('./app/api'))
  DESCRIBE("configure", require('./app/configure'))
  DESCRIBE("fs", require('./app/fs'))
  DESCRIBE("router", require('./app/router'))

module.exports = () =>

  DESCRIBE("init", require('./app/init'))
  DESCRIBE("configure", require('./app/configure'))
  DESCRIBE("api", require('./app/api'))
  DESCRIBE("fs", require('./app/fs'))
  DESCRIBE("router", require('./app/router'))

module.exports = (connection) =>

  function(session, cfg) {

    var MongoStore           = require('connect-mongo')(session)
    cfg.mongooseConnection   = connection

    return new MongoStore(cfg)

  }

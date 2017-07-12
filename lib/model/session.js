module.exports = (connection) =>

  function(session, cfg) {

    var MongoStore           = require('connect-mongo')(session)
    cfg.session.mongooseConnection   = connection

    return new MongoStore(cfg.session)

  }

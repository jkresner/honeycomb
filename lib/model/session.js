module.exports = (mongooseConnection) =>

  function(session, cfg) {

    let MongoStore    = require('connect-mongo')(session)
    let opts          = assign({mongooseConnection},cfg)

    return new MongoStore(opts)

  }

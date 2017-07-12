function run(config, done) {
  
  var Honey = require('../../../lib/index')

  var app = Honey.App(config, done)
  var model = Honey.Model(config, done)

  //   global.cache        = model.cache  
  // var analytics         = MAServer.analyticsics(config, require('./app.track'))  
  model.connect( () => {
   
    app.honey.wire({model})
       .merge(Honey.Auth)
       .chain(config.middleware, config.routes)
       .run()

  })

  return app
}

module.exports = { run }
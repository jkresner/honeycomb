function run(config, done) {

  var Honey = require('../../../lib/index')

  var app = Honey.App(config, done)
  var model = Honey.Model(config, done)


  model.connect( () => {

    app.honey.wire({model})
       .merge(Honey.Auth)
       .chain(config.middleware, config.routes)
       .run()

  })

  return app
}

module.exports = { run }

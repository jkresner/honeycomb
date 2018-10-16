module.exports = function(config, done) {

  var honey                  = require('./globals').set(config)
  honey.projector            = require('./projector')

  var express                = require('express')
  var app                    = express()
  honey.Router               = require('./router')(app, express)

  let about = honey.cfg('about')
  app.locals = assign(app.locals||{}, about ? {about} : {})

  app.honey = {

    wire({model}) {

      if (model) {
        honey.model = model
        TIME(`SET  APP MODEL`)
      }

      if (honey.cfg('templates'))
        honey.templates = require('./templates')(app, config)

      if (honey.cfg('logic'))
        honey.logic = require('./logic').init()

      if (honey.cfg('wrappers.dirs')) {
        honey.wrappers = require('./wrappers').init()
        TIME(`WIRED  Wrappers`)
      }

      return this
    },

    merge(app2) {
      var {dir,name,model,lib,logic,middleware,routes,wrappers}
        = app2.mergeConfig(config)
      if (model)
        honey.model.importSchemas(join(dir,'model'), model.opts)
      if (logic)
        require('./logic').extend(honey.logic, name.replace('honey.',''), join(dir,'logic'))
      if (middleware)
        config.middleware.dirs.unshift(join(dir,'mw'))
      if (routes)
        config.routes.dirs.unshift(join(dir,'routes'))
      if (wrappers)
        require('./wrappers').wire(join(dir,'wrappers'))

      TIME(`MERGED  ${name}`)
      return this
    },

    track(opts) {
      var cfg = honey.cfg('log.analytics')
      if (!cfg) return this
      if (cfg.ga && cfg.on)
        app.locals.analytics = { ga: cfg.ga }

      honey.analytics.init(opts, x => {
        TIME(`ANALYTICS ON (${Object.keys(cfg.model.collections)})`)
        this.inflate()
      })

      return { inflate: x => ({
                chain: x => ({ run(){} }) }) }
    },

    inflate() {
      let cfg = honey.cfg('model.cache')
      if (!cfg) return this
      honey.model.cache.prime(cfg, honey, () => this.chain.call(this).run())
      return { chain: x => ({ run(){} }) }
    },

    chain(middleware, routes) {
      honey.util.Request = require('../util/req')

      return honey.fs.require(__dirname,'chain',[app,done])

    }

  }

  return app
}

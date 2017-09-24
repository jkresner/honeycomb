module.exports = function(config, done) {

  var honey                  = require('./globals').set(config)
  honey.projector            = require('./projector')

  var express                = require('express')
  var app                    = express()
  honey.Router               = require('./router')(app, express)


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
      var cfg = honey.cfg('model.cache')
      if (!cfg) return this

      var {logic,model}  = honey
      var requires = (cfg.require||'').split(',').map(i=>i.split(':'))
      var inflates = cfg.inflate||{}

      var getters = {}
      for (var [key,ns] of requires)
        getters[key] = logic[ns][`${key}Cached`].exec

      var {canonical} = logic.routes||{}
      if (canonical)
        getters['canonical'] = logic['routes'][`canonical`].exec

      global.cache = model.cache
      cache.require(getters, e => {
        if (e) return done(e, $log('cache.require.err'.red, e))
        TIME(`CACHED  requires`)
        for (var key in inflates)
          honey.projector._.inflate[key] = cache.inflate(key, inflates[key])
        this.chain.call(this).run()
      })

      return { chain: x => ({ run(){} }) }
    },

    chain(middleware, routes) {

      var static = honey.cfg('http.static') || {}

      if (static.favicon)
        app.use('/favicon.ico', (req, res, next) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.statusCode = req.method === 'OPTIONS' ? 200 : 405
            res.setHeader('Allow', 'GET, HEAD, OPTIONS')
            res.setHeader('Content-Length', '0')
            res.end()
          } else {
            res.setHeader('Content-Type', 'image/x-icon')
            res.sendFile('favicon.ico', static.favicon)
          }})

      var {bundles,host,dirs} = config.http.static
      var js = {}, css = {}
      for (var bundle in bundles) {
        var href = bundles[bundle]
        var key = bundle.split('.')[0] // remove extension
        if (key.match(/^(js\/)/)) js[key.replace('js/','')] = href
        if (key.match(/^(css\/)/)) css[key.replace('css/','')] = href
      }

      assign(app.locals, { about: config.about, static: {js,css,host}})

      dirs.forEach(dir => {
        app.use(express.static(dir, static.opts))
        LOG('cfg.route', `GET .*`, `/${dir}/*   ${JSON.stringify(static.opts)}`)
      })

      return honey.fs.require(__dirname,'chain',[app,done])

    }

  }

  return app
}

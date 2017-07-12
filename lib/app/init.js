module.exports = function(config, done) {

  var honey                  = require('./globals').set(config)
  honey.log                  = require('./../log/index')(config.log)
  honey.projector            = require('./projector')
  
  var express                = require('express')
  var {json,urlencoded}      = require('body-parser')
  var app                    = express()
  
  
  app.use([ json(honey.cfg('middleware.json')),
            urlencoded({extended:true})   ])

  honey.Router = require('./router')(app, express)

  app.honey = {

    wire({model}) {

      if (model) {
        honey.model = model
        TIME(`SET  APP MODEL`)
      }

      //-- find a better place
      if (config.comm)
        global.COMM = require('./comm')(config)

      if (honey.cfg('templates'))
        app.setViewOpts = require('./templates')(app).setViewOpts

      if (honey.cfg('logic')) {
        honey.logic = require('./logic').init()
      }

      if (honey.cfg('wrappers.dirs')) {
        honey.wrappers = require('./wrappers').init()
        TIME(`WIRED  Wrappers`)
      }
      
      if (honey.cfg('log.analytics'))
        honey.analytics.init(x =>
          TIME(`ANALYTICS ON (${Object.keys(config.log.analytics.model.collections)})`))
      
      return this
    },

    merge(app2) {
      var {dir,model,lib,logic,wrappers,routes} = app2.mergeConfig(config)

      // if (lib)
        // assign(app.locals.libs, lib)
      if (model)
        honey.model.importSchemas(join(dir,'model'), model.opts)
      if (logic)
        require('./logic').extend(honey.logic, join(dir,'logic'))
      if (wrappers)
        require('./wrappers').wire(join(dir,'wrappers'))
      if (routes)
        config.routes.dirs.unshift(join(dir,'routes'))

      TIME(`MERGED  APP ${dir}`)
      return this
    },

    chain(middleware, routes, cached) {
    
  // var static                 = honey.cfg('http.static') || {dirs:[]}
      // for (var dir of static.dirs) {
  //   $logIt('cfg.route', `dir   GET`, `:: ${dir}/*.*   ${JSON.stringify(static.opts)}`)
  //   app.use(express.static(dir,static.opts))
  // }

      var start = x => require('./chain').call(this, app, done)
      if (!cached) return start()

      var {logic} = honey
      var map = {}
      for (var [key,ns] of config.model.cache.require.split(',').map(i=>i.split(':'))) {
        // console.log('${key}Cached', `${key}Cached`, 'ns', ns)
        map[key] = logic[ns][`${key}Cached`].exec
      }

      var ready = (ee) => {
        if (ee) return done(ee)        

        var inflate = honey.cfg('model.cache.inflate')||{}
        for (var key in inflate) 
          honey.projector._.inflate[key] = 
            cache.inflate(key, inflate[key])
                
        start().run()
      } 
      var {canonical} = logic.routes||{}

      return { 
        run: x => 
          cached(map, e => { e ? done(e, $log('e'.red)) : (
        canonical ? cache.get('canonical', canonical.exec, ready)
                  : ready())
        }) 
      }
    }
  }

  return app
}

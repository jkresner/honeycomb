module.exports = function(config, done) {

  var honey                  = require('./globals').set(config)
  honey.projector            = require('./projector')

  var worker = {}

  worker.honey =  {
    wire({model}) {

      if (model) {
        honey.model = model
        TIME(`SET  APP MODEL`)
      }

      if (honey.cfg('templates'))
        honey.templates = require('./templates')(null, config)

      if (honey.cfg('logic')) {
        honey.logic = require('./logic').init()
      }

      if (honey.cfg('wrappers.dirs')) {
        honey.wrappers = require('./wrappers').init()
        TIME(`WIRED  Wrappers`)
      }

      return this
    },

    merge(app2) {
      var {dir,name,model,lib,logic,wrappers} = app2.mergeConfig(config)
      if (model)
        honey.model.importSchemas(join(dir,'model'), model.opts)
      if (logic)
        require('./logic').extend(honey.logic, name, join(dir,'logic'))
      if (wrappers)
        require('./wrappers').wire(join(dir,'wrappers'))

      TIME(`MERGED  ${name}`)
      return this
    },


    track(opts) {
      var cfg = honey.cfg('log.analytics')
      if (!cfg) return this

      honey.analytics.init(opts, x => {
        TIME(`ANALYTICS ON (${Object.keys(cfg.model.collections)})`)
        this.inflate()
      })

      return { inflate: x => ({ run: x => {} }) }
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

      global.cache = model.cache
      cache.require(getters, e => {
        if (e) return done(e, $log('cache.require.err'.red, e))
        TIME(`CACHED  requires`)
        for (var key in inflates)
          honey.projector._.inflate[key] = cache.inflate(key, inflates[key])
        this.run.call(this)
      })

      return { run: x => ({}) }
    },

    run() {
      done()
    }

  }

  return worker
}

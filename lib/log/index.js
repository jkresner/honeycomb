 module.exports = function () {
   

  var {join}    = require('path')
  var format    = require('./format')
  var log       = require('./console')(format)

  global.LOG    = log.it 
  global.TIME   = msg => honey.cfg('log.it.app.init')
                        ? log.time('app', msg) : 0  


  if (honey.cfg('log.analytics')) {
    const Analytics = require('./analytics')

    function init(opts={}, done) {
      var {model,projector} = honey

      if (!opts.formatter)
        opts.formatter = format.track
      
      if (!opts.track) {
        var trackDef = join(honey.cfg('appDir'),'server','app.track')
        projector.add('analytics', {Projections:require(trackDef)})
        opts.track = projector['analytics'].Project
      }
      
      var {appKey} = honey.cfg('log')      
      var cfg = assign({appKey}, honey.cfg('log.analytics'))
      var mod = assign({name:'analytics', daType: 'Mongo', 
        open: ok => done(global.analytics = Analytics(cfg, model, opts))
                       }, cfg.model)

      model.importSchemas(join(__dirname, 'model'), mod)
    }
    
    honey.analytics = { init }

  }

  return format
}

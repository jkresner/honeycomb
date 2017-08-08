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
      var modOpts = assign({ name:'analytics', daType: 'Mongo' }, cfg.model)
      modOpts.open = ok => {
        global.analytics = Analytics(cfg, model, opts)
        global.TRACK = (event, ctx, data, cb) => {
          var type = event.split(':')[0]
          if (opts.track[type]) analytics.event(ctx, event, data, cb)
        }
        done()                      
      }

      model.importSchemas(join(__dirname, 'model'), modOpts)
    }
    
    honey.analytics = { init }

  }

  return format
}

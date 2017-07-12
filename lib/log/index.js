module.exports = () => {

  var cfg         = honey.cfg('log') 
  var format      = require('./format')
  var log         = require('./console')(format)

  global.LOG       = log.it 
  global.TIME      = msg => honey.cfg('log.it.app.init')
                        ? log.time('app', msg) : 0  

  if (cfg.analytics) {
    honey.analytics = { 
      init(done) {
        var {join} = require('path')
        var {model,projector} = honey
        var trackDef = join(global.config.appDir,'server','app.track')
        projector.add('analytics', {Projections:require(trackDef)})
        
        var opts = { formatter: format.track,
                     track: projector['analytics'].Project }

        var mod = assign({ name:'analytics', daType: 'Mongo', open: ok => {
          global.analytics = require('./analytics')(cfg.analytics, model, opts)
          done()
        }}, cfg.analytics.model)

        model.importSchemas(join(__dirname,'model'), mod)
      }
    }
  }
} 

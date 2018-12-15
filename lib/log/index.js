 module.exports = function () {

  let cfg       = honey.cfg('log')

  var format    = require('./format')

  if ((cfg.it||{}).mw)
    assign(format,{mw:require('./middleware')()})

  var log       = require('./console')(format)

  global.LOG    = log.it
  global.TIME   = msg => cfg.verbose || honey.cfg('log.it.app.init')
                          ? log.time('app', msg) : 0


  if (cfg.analytics) {
    // Need to add "mongo" to config.model.da = []

    const Analytics = require('./analytics')

    function init(opts={}, done) {
      let {model,projector} = honey

      opts.app = opts.app || cfg.appKey
      opts.formatter = opts.formatter || format.track

      if (!opts.track) {
        let trackDef = join(honey.cfg('appDir'),'server','app.track')
        projector.add('analytics', {Projections:require(trackDef)})
        opts.track = projector['analytics'].Project
      }

      let modOpts = assign({ name:'analytics', daType: 'Mongo' }, cfg.analytics.model)
      modOpts.open = ok => {
        global.analytics = Analytics(cfg.analytics, model, opts)
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

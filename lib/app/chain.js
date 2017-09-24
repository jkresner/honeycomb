module.exports = function(app, ready) {

  honey.util.Request         = require('../util/req')
  let cfg                    = honey.cfg('middleware')
  let {json,urlencoded}      = require('body-parser')
  let mw                     = require('./../middleware/index')(honey.util)

  if (cfg.api)
    app.API                  = require('./api')(app, mw, cfg.api)

  for (let dir of cfg.dirs) {
    let set = honey.fs.requireDir(dir, {dependencies:[app, mw, cfg],strict:false})
    for (let name in set) {
      if (!cfg.hasOwnProperty(name) || cfg[name] !== null)
        mw.cache(name, set[name])
    }
    LOG('cfg.middleware', 'mw.cache', `${dir}`)
  }

  if (cfg.livereload && !mw.$.livereload)
    mw.cache('livereload',   require('connect-livereload')(cfg.livereload))

  if (cfg.jsonLimit && !mw.$.jsonLimit)
    mw.cache('jsonLimit',    json(cfg.jsonLimit))

  if (!mw.$.wrap)
    mw.cache('wrap',         mw.req.wrap({context:cfg.ctx}))

  app.honey.middleware  = mw
  TIME(`MIDDLEWARE Cached`, Object.keys(mw.$))

  function ctx(req, res, next) {
    req.locals = req.locals || {}
    req.ctx = {}  //-- move to req.locals.ctx ?
    for (let key of ['ip','ref','sId','ua','ud','utm','user'])
      honey.util.Request.ctx.set(req, cfg.ctx, key)
    next()
  }

  app.use([                  ctx,
                             json(cfg.json),
                             urlencoded({extended:true}) ])

  if (config.routes) {
    for (let dir of config.routes.dirs) {
      honey.fs.requireDir(dir, {dependencies:[app, mw, config.routes]})
    }
    for (let router in app.routers)
      app.routers[router].mount()

    TIME(`ROUTES      Chained`)

    if (app.sitemap)
      LOG('cfg.sitemap', app.sitemap.sort().join('\n'))
  }


  var port = honey.cfg('http.port')
  var cb = ready || (e => {})
  var success = x => cb(null, TIME(`LISTENING   on:${port}`))

  app.honey.run = () =>
    app.use(mw.$.session)
       .use(mw.$.notfound || mw.res.notfound({name:'404'}))
       .use(mw.$.error || mw.res.error())
       .listen(port, success).on('error', cb)

  return app.honey

}

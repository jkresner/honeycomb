module.exports = function(app, ready) {

  let {json,urlencoded}      = require('body-parser')
  let cfg                    = honey.cfg('middleware')

  app.use([                  json(cfg.json),
                             urlencoded({extended:true}) ])

  let mw                     = require('./../middleware/index')()

  if (cfg.api)
    app.API                  = require('./api')(app, mw, cfg.api)

  for (let dir of cfg.dirs) {
    let set = honey.fs.requireDir(dir, {dependencies:[app, mw, cfg],strict:false})
    for (let middleware in set)
      mw.cache(middleware,   set[middleware])
    // LOG('cfg.middleware', 'mw.cache', `${dir}`)
  }

  if (cfg.livereload && !mw.$.livereload)
    mw.cache('livereload',   require('connect-livereload')(livereload))

  if (cfg.jsonLimit && !mw.$.jsonLimit)
    mw.cache('jsonLimit',    json(cfg.jsonLimit))

  if (!mw.$.wrap)
    mw.cache('wrap',         mw.req.wrap({context:cfg.ctx}))

  this.middleware  = mw
  TIME(`MIDDLEWARE Cached`, Object.keys(mw.$))


  if (config.routes) {
    for (var dir of config.routes.dirs)
      honey.fs.requireDir(dir, {dependencies:[app, mw, config.routes]})
    for (var router in app.routers)
      app.routers[router].mount()
    TIME(`ROUTES      Chained`)

    if (app.sitemap)
      LOG('cfg.sitemap', app.sitemap.sort().join('\n'))
  }


  var port = honey.cfg('http.port')
  var cb = ready || (e => {})
  var success = x => cb(null, TIME(`LISTENING   on:${port}`))

  this.run = () =>
    app.use(mw.$.notFound || mw.res.notFound({logIt:honey.cfg('log.it.mw.notFound'),name:'404 '}))
       .use(mw.$.error || mw.res.error())
       .listen(port, success).on('error', cb)

  return this


}

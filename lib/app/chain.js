module.exports = function(app, ready) {

  var {json,urlencoded}      = require('body-parser')
  var {ctx,livereload,api,authd,dirs,jsonLimit} = config.middleware || {}


  app.use([ json(honey.cfg('middleware.json')),
            urlencoded({extended:true})   ])


  var mw   = require('./../middleware/index')()

  if (livereload)
    mw.cache('livereload', require('connect-livereload')(livereload))

  if (api)         app.API = require('./api')(app, mw, api)

  if (jsonLimit)
    mw.cache('jsonLimit', json(jsonLimit))

  for (var dir of dirs) {
    var set = honey.fs.requireDir(dir, {dependencies:[app, mw, config.middleware],strict:false})
    for (var middleware in set)
      mw.cache(middleware, set[middleware])

    LOG('cfg.middleware', 'mw.cached', dir)
  }

  TIME(`MIDDLEWARE Cached`, Object.keys(mw.$))

  //-- Ensure req.wrap is first middlware in the meanair chain
  app.use(mw.$.wrap || mw.req.wrap({context:ctx}))


  if (config.middleware.session && !mw.$.session) {
    const session = require('express-session')
    var store = honey.model.sessionStore(session, config.middleware)
    var project = _.get(honey,'projector.auth.Project.session')
    var sessionOpts = assign({session}, config.middleware.session, {store,project})
    var {restrict} = config.middleware.session
    if (restrict) sessionOpts.restrict = req => new RegExp(restrict).test(req.ctx.ud)
    mw.cache('session', mw.session.touch(sessionOpts))
    TIME(`SESSION   Working`)
  }

  if (config.routes) {
    for (var dir of config.routes.dirs)
      honey.fs.requireDir(dir, {dependencies:[app, mw, config.routes]})
    for (var router in app.routers)
      app.routers[router].mount()
  }

  this.middleware  = mw
  TIME(`ENDING      Route Chains`)


  if (app.sitemap)
    LOG('cfg.sitemap', app.sitemap.sort().join('\n'))


  var port = honey.cfg('http.port')
  var cb = ready || (e => {})
  var success = x => cb(null, TIME(`LISTENING   on:${port}`))


  this.run = () =>
    app.use(mw.$.notFound || mw.res.notFound({logIt:honey.cfg('log.it.mw.notFound'),name:'404 '}))
       .use(mw.$.error || mw.res.error())
       .listen(port, success).on('error', cb)

  return this


}

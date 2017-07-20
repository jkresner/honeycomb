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

  if (config.auth) {
    mw.cache('setReturnTo', mw.session.remember('query.returnTo'))
    mw.cache('inflateMe', mw.data.recast('user','user._id',{required:false}))
    mw.cache('authd', mw.res.forbid('anon',
      function({user}) { if (!user) return '!authenticated' }, authd))
  }

  for (var dir of dirs) {
    var set = honey.fs.requireDir(dir, {dependencies:[app, mw, config.middleware],strict:false})
    for (var middleware in set) 
      mw.cache(middleware, set[middleware])
  
    LOG('cfg.middleware', 'mw.cached', dir)
  }

  TIME(`MIDDLEWARE Cached`, Object.keys(mw.$))

  //-- Ensure req.wrap is first middlware in the meanair chain
  app.use(mw.$.wrap || mw.req.wrap({context:ctx}))


  mw.cache('logic', (path, opts) => function(req, res, next) {
    opts = opts || {}
    opts.params = opts.params || []
    opts.assign = opts.assign || false
    var [group,fn] = path.split('.')
    var logic = honey.logic[group][fn]

    var args = [(e,r) => {
      if ((r||{}).htmlHead)
        req.locals.htmlHead = assign(req.locals.htmlHead||{},r.htmlHead)
      if (!r && opts.required !== false)
        e = assign(Error(`Not Found ${req.originalUrl}`),{status:404})
      if (!e) {
        if (opts.assign) req.locals.r[opts.assign] = logic.project(r)
        else req.locals.r = assign(req.locals.r||{}, logic.project(r))
      }
      return next(e)
    }]

    for (var arg of opts.params) req.params[arg] = req[arg]
    for (var arg in req.params) args.unshift(req.params[arg])

    if (!/get/i.test(req.method) && !logic.validate)
      throw Error(`mw.logic fail: ${path}.validate not defined`)
    else if (logic.validate)
    {
      var inValid = logic.validate.apply(req, _.union([req.user],args))
      if (inValid) return next(inValid)  
    }

    
    logic.exec.apply(req, args)
  })

  if (config.middleware.session && !mw.$.session) {
    const session = require('express-session')
    var store = honey.model.sessionStore(session, config.middleware)
    var sessionOpts = assign({session}, config.middleware.session, {store})
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
    app.use(mw.$.notFound || mw.res.notFound())
       .use(mw.$.error || mw.res.error())
       .listen(port, success).on('error', cb)

  return this


}

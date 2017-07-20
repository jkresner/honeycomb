module.exports = ({$mw,$req},Lib) => ({


  /**                                                                      api(
  *  Object    @opts[optional]
  *   [String]  .logIt
  *   Function  .redirect takes request object and returns a url to redirect to
  *                                                                          */
  api(opts) {
    opts = opts || {}
    var logIt = opts.logIt || false
    var formatter = opts.formatter || function(req, r) {
      var formatted = (req.body && Object.keys(req.body).length > 0)
        ? `${'req'.yellow} ${JSON.stringify(req.body).replace(/\"([^(\")"]+)\":/g,"$1:".dim).gray} ` : ''
      return formatted + `${'res'.yellow} ${JSON.stringify(r||{}).replace(/\"([^(\")"]+)\":/g,"$1:".dim).gray} `
    }
    return function(req, res, done) {
      var r = req.locals ? req.locals.r : null
      var e = null

      if (req.method == 'GET' && !r)
        e = assign(Error(`Not found ${req.originalUrl}`, {status:404}))
      else if (req.method == 'DELETE')
        res.status(200).json({})
      else
        res.status(200).json(r)

      done(e, logIt ? `${e || formatter(req, r)}` : null, $req.STOP)
    }
  },


  /**                                                                   forbid(
  *  Gate for logic determining if a request should be authorized or not
  *
  *  String    @name for your allow logic
  *  Function  @forbidden logic returning truthy to forbid the req(uest)
  *
  *                                                                          */
  forbid(name, forbidden, opts) {
    this.mwName = `forbid:${name}`
    opts = opts || {}
    var redirect = opts.redirect 
    if (!redirect) {
      if (opts.returnTo) redirect = ((req) => `/?returnTo=${req.url}`)
      else redirect = (() => '/')
    } 
    
    return function(req, res, done) {
      var {sId,user,ref} = req.ctx
      var refStr = `${ref?' <<< '+ref : ''}`.blue

      var isForbidden = forbidden(req)
      if (!isForbidden)
        return done(null, `${'pass'.gray}${refStr}`)

      // console.log('isForbidden', isForbidden, sId, user, ref, req.originalUrl)
      if (req.originalUrl.match('(/api/|login)'))
        res.status(403).json({})
      else {
        //-- save url user attempted access for graceful redirect after login
        if (req.session) req.session.returnTo = req.url
        res.status(302).redirect(redirect(req))
      }

      done(null, `${(res.statusCode+':'+isForbidden).magenta}${refStr}`, $req.STOP)
    }
  },

  /**                                                                     page(
  *  Rendering pages with consistent application info, html resources and
  *  user data
  *
  *  String    @name of the server template used to render the page
  *  Object    @opts[optional]
  *   Object    .about meta data - e.g. version / author / contact email etc.
  *   Object    .bundles javascript and css bundles
  *   String    .layout template name for wrapping around @name's rendering
  *                                                                          */
  page(name, opts = {}) {
    this.mwName = `page:${name}`
    // var layout = opts.hasOwnProperty('layout') ? opts.layout : 'layout'

    return function(req, res, done) {      
      var authenticated = (req.user && req.isAuthenticated()) === true
      var session = authenticated ? req.user : {id:req.sessionID, authenticated}
      var ud = { apple: /apple/i.test(req.ctx.ud), android: /android/i.test(req.ctx.ud) }
      var data = assign(opts, {authenticated,session,ud}, req.locals)
      res.render(name, data)
      // $log(`page:${name}`, data)
      done(null, `${opts.layout||''}:${name.dim}`, $req.STOP)
    }
  },


  /**                                                                   notFound(
  *  Object    @opts[optional]
  *    Object   .onBot rather than respond a 404 error, respond with something
  *              custom like empty 200 and while you are at it take other custom
  *              behavior like logging or security measures. Make sure to call
  *              res.send or alternative to fire req.finish
  *                                                                          */
  notFound(opts) {
    opts = opts || {}
    var onBot = opts.onBot

    return function(req, res, done) {
      var {ctx} = req
      if (onBot && $req.byBot(req, 'notFound')) {
        onBot(req, res)
        done(null, `${ctx.ip} res.empty[${res.get('status')||'200'}] to ${ctx.ud} ${ctx.ua}`, $req.STOP)
      }
      else {
        var {user,ref,sId,ua} = req.ctx || {}
        var e = Error(`Not Found ${req.originalUrl}${ref?' << '+ref:''}`)
        e.stackTraceLimit = 10
        done(assign(e,{status:404}), `res[404] to ${(user||{}).name?user.name:sId} ${ua}`) //, $req.STOP)
      }
    }
  },


  /**                                                                    error(
  * Error handler (last middleware) or called after any middleware invokes
  * next(e) with an argument
  *
  *  Object    @opts[optional]
  *   Object    @renderOpts[optional]
  *     String    .layout defaults to false (none), else name of layout template
  *     Object    .about details about app including bug report url / contact info
  *   Boolean   .quiet error output (error the message and no stack dimmed)
  *   Function  .formatter fn formatting request and error info
  *   Function  .onError hook for custom behavior like sending emails etc.
  *   Function  .resAs fn returns response type with req as its arg
  *   Function  .renderCustom fn alternative to render alternate contentTypes
  *               in a your custom way instead of res.json({message}) and
  *               res.render('error', {error:e,user:req.user}) approaches
  *                                                                         )*/
  error(opts = {}) {
    this.noWrap = true
    opts.render = opts.render || {}
    opts.render.view = opts.render.view || 'error'

    // var renderCustom = opts.renderCustom
    var resAs = opts.resAs || (({originalUrl,method}) =>
      originalUrl.match('/api/')||method.match(/(POST|PUT)/i) ? 'json':'html')

    return function(e, req, res, next) {
      $mw.name('req', 'error', req)
      
      if (!e.message) e = Error(e)
      res.status(e.status || 400)

      var contentType = resAs(req)
      if (contentType.match('json'))
        res.json({message:e.message})
      // else if (renderCustom)
        // renderCustom(req, e)
      else if (contentType.match('html'))
        res.render(opts.render.view, assign({error:e,user:req.user}, opts.render))      
      else
        throw Error(`middleware.error renderCustom for contentType ${contentType}`)

      var {ctx} = req

      if (opts.verbose)
        console.log(`err[${e.status||400}].${contentType}`.red, honey.log.issue({e, req}))
      else if (opts.quiet)
        console.log(`err[${e.status||400}].${contentType}`.red.dim, `${e.message||e}`.gray.dim)

      $mw.done(null, `${e.message}`, $req.STOP)

      if (opts.onError)
        opts.onError(req, e)
    }
  }


})

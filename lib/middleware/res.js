module.exports = ({$mw,$req}) => ({


  /**                                                                      api(
  *  Object    @opts[optional]
  *   [String]  .logIt
  *   Function  .redirect takes request object and returns a url to redirect to
  *                                                                          */
  api(opts={}) {
    this.mwName = 'api:json'
    var logIt = opts.logIt || false
    var formatter = opts.formatter || ((req, r={}) =>
      `\n${'  INP'[logIt]}${honey.log.json(assign(req.body,req.params,req.query))}`+
      `\n${'  OUT'[logIt]}${honey.log.json(r)}`)

    return function(req, res, done) {
      let {r} = req.locals||{}

      if (req.method == 'GET' && !r)
        var e = assign(Error(`Not found ${req.originalUrl}`, {status:404}))
      else if (req.method == 'DELETE')
        res.status(200).json({})
      else
        res.status(200).json(r)

      done(e, logIt ? `${e||formatter(req, r)}` : null, $req.STOP)
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
      if (opts.returnTo)
        redirect = req =>
          `${honey.cfg('auth.loginUrl')||'/'}?returnTo=${encodeURIComponent(req.originalUrl)}`
      else
        redirect = (() => '/')
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
        if (req.session) req.session.returnTo = req.originalUrl
        res.redirect(redirect(req))
      }

      done(null, `${res.statusCode}:`.dim+`${'block'.magenta}${isForbidden}${refStr}`, $req.STOP)
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
      let authenticated = (req.user && req.isAuthenticated()) === true
      // todo reconsider session data
      let session = authenticated ? req.user : {id:req.sessionID, authenticated}
      let ud = { apple: /apple/i.test(req.ctx.ud), android: /android/i.test(req.ctx.ud), ms: /ms/i.test(req.ctx.ud) }
      let data = assign(opts, {authenticated,session,ud}, req.locals)
      res.render(name, data)
      done(null, `${req.ctx.sId} ${$req.uid(req)}`, $req.STOP)
    }
  },


  /**                                                                   notFound(
  *  Object    @opts[optional]
  *    Object   .onBot rather than respond a 404 error, respond with something
  *              custom like empty 200 and while you are at it take other custom
  *              behavior like logging or security measures. Make sure to call
  *              res.send or alternative to fire req.finish
  *                                                                          */
  notfound(opts={}) {
    this.noWrap = true
    var mwName = opts ? (opts.name || 'notfound') : `404`
    // var logIt = opts.logIt || false
    var onBot = opts.onBot

    return function(req, res, next) {
      $mw.name('res', mwName, req)
      var {user,ref,sId,ua,ud,ip} = req.ctx || {}
      var info = null, stop = false, e = null;
      if (onBot && $req.byBot(req, 'notfound')) {
        info = `${ip} res.empty[${res.get('status')||'200'}] to ${ud} ${ua}`
        onBot(req, res)
      }
      else {
        info = `${(user||{}).name?user.name:sId}`+` ${ua}`.dim
        e = Error(`Not Found ${req.originalUrl}${ref?' << '+ref:''}`)
        assign(e, { status:404, stackTraceLimit: 10 })
      }
      // if (logIt)
      //   $mw.done(e?Error(""):null, info)

      next(e)
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
  *   Boolean   .quiet no error output (should only be with with testing)
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

    let env = opts.env || process.env.ENV
    let render = {
      custom: opts.render.custom || (x => false),
      default: opts.render.default || 'html',
      opts: opts.render.opts || {},
      view: opts.render.view || 'error'
    }
    let verbose = opts.verbose || process.env.LOG_VERBOSE
    let quiet = process.env.LOG_QUIET
    let ignore = opts.ignore ? opts.ignore : {test:x=>false}

    return function(e, req, res, next) {
      let content = req.get('accept') || render.default
      let message = (e||{}).message || `<${typeof e}>${e?e:''}`
      let status = (e||{}).status || 400
      let ignored = ignore.test(message)

      let lb = $mw.step(`error${ignored?':ignored':''} `.red+`${status}`)
      if (verbose)
        console.log(lb, honey.log.issue({e, req}).replace(/\n/g,'\n  ').dim, '\n')
      else if (!quiet)
        $mw.done(e, content, $req.STOP)

      let info = _.select(e, /prod/i.test(env) ? 'message' : 'message status stack data')
      let data = assign({error:info,user:req.user,authenticated:!!req.user}, render.opts||{})

      res.status(status)

      if (render.custom.apply(this, arguments))
        res.end()
      else if (/html/.test(content))
        res.render(render.view, data)
      else if (/json/.test(content))
        res.json(info)
      else
        res.status(501).send($log(`mw.error: render.custom["${content}"] not implemented`))

      if (!ignored && opts.onError)
        try {
          opts.onError(req, e)
        } catch (ex) {
          console.log(`Exception in mw.error.onError:\n\nException: {ex.stack}\n\nError: {e.stack||e}\n`.red)
        }
    }
  }


})

module.exports = ({$req},{passport}) => ({

  /**                                                                    touch(
  * Yikes!
  *
  * Object     @opts[optional]
  *   Function  .Store class to persist the session
  *   String    .anonData
  *   String    .authdData
  *   String    .mwName custom override of this.mwName used in mw.trace
  *   String    .stubID override hardcode unNown...
  *   Function  .onRestrict middleware fn used to create a restricted
  *              session. If unspecified, defaults to unpersisted fake session
  *   Function  .restrict returns true if session should be restricted with
  *               req as its arg. Defaults to true is request is by a bot
  *
  /                                                                         )*/
  touch(opts) {
    this.mwName         = opts.mwName || `session`
    // var store           = new Store(opts.store)

    // var cfg = assign({}, opts, {store})
    var persist         = opts.session(opts)

    var chain           = function() { persist.apply(this, arguments) }

    if (opts.authdData) {
      var attrs         = opts.authdData.split(' ')
      var project       = opts.project || (user => _.pick(user, attrs))
      var serialize     = (user, cb) => cb(null, project(user))
      passport.serializeUser(opts.serializeUser || serialize)

      var deserialize   = (session, cb) => cb(null, session)
      passport.deserializeUser(opts.deserializeUser || deserialize)

      var passportInit = passport.initialize(passport)
      var passportSession = passport.session(passport)

      chain = function(req, res, next) {
        persist.call(this, req, res, e =>
          passportInit.call(this, req, res, e =>
            passportSession.call(this, req, res, e => next() ) ) ) }
    }

    if (opts.restrict) this.mwName = `session:restricted`
    var onRestrict = opts.onRestrict || ((req, res, next) => {
      req.session = {}
      req.sessionID = opts.stubID || 'unNOwnSZ3Wi8vcEnaKzhygGG2a2RkjZ2'
      next(null, 'restricted')
    })
    var restrict = opts.restrict || (req => false)

    return function(req, res, done) {
      restrict(req)
        ? onRestrict(req, res, done)
        : chain.call(this, req, res, e => done(e, $req.idCtx(req)))
    }
  },


  /**                                                                   orient(
  * Store context info of first request of a new session
  *
  * Object     @opts[optional]
  *   Function  .skipIf some condition on the request object is met, do not
  *              store context on the session... e.g. landing on a url to
  *              bait bots etc.
  *   Function  .onFirst hook for custom behavior e.g. tracking analycs
  *   String    .attr of req.session to store orientation data
  /                                                                         )*/
  orient(opts) {
    opts = opts || {}
    var onFirst = opts.onFirst
    var skipIf = opts.skipIf || (req => false)
    var attr = opts.attr || 'firstRequest'

    return function(req, res, done) {
      var {ip,sId,ref} = req.ctx
      $req.idCtx(req)

      if (skipIf(req))
        done(null, $req.SKIP)
      else if ($req.byBot(req, 'orient'))
        done(null, 'ignored bot')
      else if (!req.method.match(/get/i))
        done(null, `ignored http:${req.method}`)
      else if (req.isAuthenticated() || req.session[attr])
        done(null, 'oriented')
      else {
        var ts = new Date().getTime()
        req.session[attr] = assign({url:req.originalUrl}, {ip,sId,ref,ts})

        if (onFirst) onFirst(req, res)

        done(null, `orienting ${attr}`)
      }
    }
  },


  /**                                                                  remeber(
  * Persist data from the req.[src] onto session.[dest]
  *
  * String     @src property on the request (can be nested) to store
  *              E.g. 'req.body.email', 'req.query.returnTo'
  * Object     @opts[optional]
  *   String    .dest name of attr  (can not be nested) to store on the session
  *               defaults to leaf of src. E.g. 'query.returnTo' => 'returnTo'
  *               'req.body.email' => 'email'
  *   Boolean   .overwite update existing values, defaults to true
  /                                                                         )*/
  remember(src, opts) {
    var opts = opts || {}
    var dest = opts.dest || src.split('.').pop()
    var overwrite = opts.overwrite || true
    return function(req, res, done) {
      var logData = `session.${dest} no set`
      var val = _.get(req, src)
      if (val != undefined && (overwrite || !res.session[dest])) {
        req.session[dest] = val
        logData = `session.${dest} set to ${val}`
      }
      done(null, logData)
    }
  }


})

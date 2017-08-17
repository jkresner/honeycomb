module.exports = ({$req},{passport}) => ({

  /**                                                                    admit(
  * Used on:
  * 1) Successful login
  * 2) Successful oauth
  *
  * Object     @opts
  *   String     .redirectUrl
  *   Boolean    .json respond with application/json instead of a redirect
  /                                                                         )*/
  admit(opts) {
    opts = opts || {}
    opts.redirectUrl = opts.redirectUrl || '/'

    return function(req, res, done) {
      var logData = "json"

      if (/json/.test(req.headers.accept||''))
        res.json(req.session.passport.user)
      else {
        var redirectUrl = opts.redirectUrl
        if (req.session && req.session.returnTo)
        {
          redirectUrl = req.session.returnTo
          delete req.session.returnTo
        }
        res.type("text").redirect(redirectUrl)
        logData = `redirect => ${redirectUrl}`
      }

      done(null, logData, $req.STOP)
    }
  },


  /**                                                                    logout(
  * Nuff said
  *
  * Object     @opts
  /                                                                         )*/
  logout(opts) {
    opts = opts || {}
    opts.redirectUrl = opts.redirectUrl || '/'

    return function(req, res, done) {
      req.logout()
      // res.redirect(opts.redirectUrl)

      done(null, 'logged out')
    }
  },


  /**                                                                    logout(
  * OAuth handshake used for login and linking of 3rd party identities
  *
  * String     @provider name of 3rd party service
  * Object     @strategy class for passport oauth implementation with 3rd party
  * Object     @opts
  *   Function   .success custom function to use on successful oauth handshake
  /                                                                         )*/
  oauth(provider, Strategy, logic, opts = {}) {
    opts.scope = opts.scope || []
    opts.passReqToCallback = true


    var oauthFn = logic.exec || logic
    // : () => {
    //  if (logic.validate) 
   // }

    var success = (req, token, refresh, profile, cb) => 
      oauthFn.call(req, provider, profile._json, {token,refresh}, cb)


    passport.use(provider, new Strategy(opts, success))

    this.mwName = `oauth:${provider}:${opts.logic}`
    return function(req, res, done) {
      req.locals = req.locals || {}
      var passportOpts = {}
      // TODO: test overriding scope
      // if (req.query.scope) opts.scope = req.query.scope.split(',')

      // If the users is ALREADY logged in (got a session), then we
      // handshake with the provider AND do not do anything with the session
      // * the name authorize is kind of unclear, hence the comments
      var passMethod = req.isAuthenticated() ? 'authorize' : 'authenticate'

      // var ref = (req.ctx.ref ? (` <<< `.cyan+`${req.ctx.ref}`.replace(/\/+$/, '').blue) : '')
          // .replace('https://','').replace('http://','').replace('www.','')
      // $log(`passport:${passMethod} ${provider}`.white, req.sessionID.substring(0,12).cyan, ref)
      passport[passMethod](provider, passportOpts)(req, res, done)
    }
  },


  /**                                                                 password(
  * WIP
  * Object     @opts
  *   Function   .Strategy override to use instead of
  *   Function   .logic
  *   String     .usernameField
  *   String     .passwordField
  /                                                                         )*/
  password(feature, Strategy, logic, opts) {
    this.mwName = `password:${feature}`
    opts = opts || {}
    // opts.passReqToCallback = true
    // var provider = `password-${feature}`
    // var success = (req, id, pass, cb) => {
    //   $log('mw.password.success'.cyan, id, pass)
    // }
    // passport.use(provider, new Strategy(opts, success))

    return function(req, res, done) {      
      // var passMethod = req.isAuthenticated() ? 'authorize' : 'authenticate'
      logic.call(req, feature, req.body, (e, user, info) => {
        if (e) return done(e)
        if (!user) return res.status(401).json({message:info||`No user matching credentials`})
        // passport[passMethod](provider, {})(req, res, done)
        if (req.user) 
          done(null, "success")  
        else 
          req.logIn(user, e => done(e, "success + login"))
      })

    }
  }


})

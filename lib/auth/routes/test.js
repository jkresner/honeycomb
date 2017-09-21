module.exports = (app, mw, {auth}) => {

  if (!auth.test) return

  var router = app.routers['auth']
  var {login,oauth} = auth.test
  var {DRY} = honey.logic

  if ((login||{}).logic) {
    login.fn = honey.logic.auth[auth.test.login.logic].chain

    mw.auth.extend('oauthTest', function() {
      this.mwName = 'oauth:test'
      return (req, res, next) => {
        login.handler.call(req, req.body, (e, user) => {
          if (e) return next(assign(e,{status:401}))
          req.logIn(user, next)
        })
      }
    })

    router.post(login.url, mw.auth.oauthTest())
  }

  if ((oauth||{}).logic) {
    oauth.fn = honey.logic.auth[auth.test.oauth.logic].chain

    router.post(oauth.url, (req, res, next) => {
      let {_json,provider,token,refresh} = req.body
      let tokens = {refresh,token:token||'token'}
      DRY.auth.userByAuth(req.user, provider, _json, (e, user) => {
        if (e) return next(assign(e,{status:401}))
        oauth.fn.call(req, user, provider, _json, tokens, (e, r) => {
          if (e) return next(e)
          req.user ? next(null, r) : req.logIn(r, next)
        })
      })
    })
  }

}

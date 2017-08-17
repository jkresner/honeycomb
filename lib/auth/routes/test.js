module.exports = (app, mw, {auth}) => {

  if (!auth.test) return

  var router = app.routers['auth']
  var {login,oauth} = auth.test

  if ((login||{}).logic) {
    let logic = honey.logic.auth[auth.test.login.logic]
    var {exec,project} = logic
    // if (project) {}
    login.fn = exec || logic
    
    router.post(login.url, (req, res, next) => 
      login.handler.call(req, req.body, (e, user) => {
        if (e) return next(e)
        req.logIn(user, next)
      }))
  }
  
  if ((oauth||{}).logic) {
    // oauth.fn = {}        
    // for (var provider in config.auth.oauth) 
      // oauth.fn[provider] = honey.logic.auth[oauth.logic].exec
    
    oauth.fn = honey.logic.auth[auth.test.oauth.logic].exec

    router.post(oauth.url, (req, res, next) => 
      oauth.handler.call(req, req.body, (e, user) => {
        if (e) return next(e)
        req.user ? next(null, user) : req.logIn(user, next)
      }))
  }
  
}

module.exports = (app, mw) => {

  var {test} = global.config
  if (!(test||{}).auth) return

  var router = app.routers['auth']
  var {login,oauth} = test.auth

  if ((login||{}).fnName) {
    var loginFn = honey.logic.auth[login.fnName]
    var {exec,project} = loginFn
    if (exec && project) {
      loginFn = function() {
        var args = [].slice.call(arguments)
        var cb = args.pop()
        args.push( (e,r) => cb(e, e ? null : project(r) ) )
        exec.apply(this, args)
      }
    }
    else if (exec)
      loginFn = exec

    config.test.auth.login.fn = loginFn
    router.post(login.url, login.handler, mw.auth.admit({json:true}))
  }


  if ((oauth||{}).fnName) {
    config.test.auth.oauth.fn = {}
    for (var provider in config.auth.oauth)
      config.test.auth.oauth.fn[provider] =
        honey.logic.auth[config.auth.oauth[provider].logic].exec

    router.post(oauth.url, mw.$.inflateMe, oauth.handler)
  }


}

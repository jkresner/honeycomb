module.exports = (app, mw, cfg) => {


  app.get('/logout', (req,res,next) => res.redirect('/auth/logout'))


  var {oauth,password,loggedinUrl} = honey.cfg('auth')
  var OAuthStrategy = oauth ? require('../oauth/_base') : null
  var oauth = oauth || {}
  var password = password || {}
  if (Object.keys(password) > 1 && !password.login)    // login signup reset
    throw Error(`auth.password features ${pwd} require password.login configured`)

  var router = honey.Router('auth',{mount:'/auth',type:'auth'})
    .use(mw.$.session)
    .use(mw.$.trackAuth)
    .use(mw.auth.admit({redirectUrl:loggedinUrl}),{end:true})

    .get('/logout', mw.$.authd, mw.$.inflateMe,
      //-- ugly
      (req, res, next) =>  next(null, req.ctx.user = _.pick(req.user, '_id', 'name', 'username')),
      mw.auth.logout())

    .use(mw.$.setReturnTo)
    .use(mw.$.inflateMe)

  for (var feature in password) router
    .post(`/password/${feature}`, mw.auth.password(
      feature,
      require('passport-local').Strategy,
      honey.logic.auth[password[feature].logic].exec,
      assign({}, password[feature], password.login)  // opts
    ))

  for (var provider in oauth) router
    .get(`/${provider}/callback`, mw.auth.oauth(
      provider,
      OAuthStrategy(provider), // Strategy,
      honey.logic.auth[oauth[provider].logic].chain, // verifyCallback
      oauth[provider]   // opts
    ))

}

module.exports = (app, mw, cfg) => {


  app.get('/logout', (req,res,next) => res.redirect('/auth/logout'))


  let {oauth,token,password,loggedinUrl} = honey.cfg('auth')

  if (Object.keys(password||{}).length > 1 && !password.login)    // login signup reset
    throw Error(`Set config.auth.password.login`)
  password = password || {}

  var OAuthStrategy = oauth ? require('../oauth/_base') : null
  oauth = oauth || {}


  var router = honey.Router('auth',{mount:'/auth',type:'auth'})
    .use(mw.$.session)
    .use(mw.$.trackAuth)
    .use(mw.auth.admit({redirectUrl:loggedinUrl}),{end:true})

    .get('/logout', mw.$.authd, mw.$.inflateMe,
      //-- ugly
      (req, res, next) =>  next(null, req.ctx.user = _.pick(req.user, '_id', 'name', 'username')),
      mw.auth.logout())


  if ((token||{}).onetime) router
    .get(`/ott/:user/:token`,  
      mw.$.inflateExisting,
      (req, res, next) => {
        let {existing,params} = req
        let args = [params.token, params.user, existing, next]
        honey.logic.auth.token.chain.apply(req, args)
    })

  router
    .use(mw.$.setReturnTo)
    .use(mw.$.inflateMe)

  for (var feature in password) router
    .post(`/password/${feature}`, mw.auth.password(
      feature,
      require('passport-local').Strategy,
      honey.logic.auth[password[feature].logic].chain,
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

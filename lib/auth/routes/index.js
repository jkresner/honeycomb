module.exports = (app, mw, cfg) => {

  
  app.get('/logout', (req,res,next) => res.redirect('/auth/logout'))


  var {oauth,password} = honey.cfg('auth')
  var OAuth = oauth ? require('../oauth/_base') : x => null
  var Pwd = password ? require('../password/_base') : x => null

  var router = honey.Router('auth',{mount:'/auth',type:'auth'})
    .use(mw.$.session)
    .use(mw.$.trackAuth)
    .useEnd(mw.auth.admit())

    .get('/logout', mw.$.authd, mw.$.inflateMe,
      //-- ugly
      (req, res, next) =>  next(null, req.ctx.user = _.pick(req.user, '_id', 'name', 'username')),
      mw.auth.logout())

    .use(mw.$.setReturnTo)

  
  Object.keys(password||{})
    .filter(feature => password[feature])
    .forEach(f => 
      router.post(`/password/${f}`,  // login signup set reset
        mw.$.inflateMe,
        mw.auth.password(f, require('passport-local').Strategy, Pwd(f))
      ))

  
  Object.keys(oauth||{})
    .forEach(provider => 
      router.get(`/${provider}/callback`,
        mw.$.inflateMe,
        mw.auth.oauth(          
          provider, 
          OAuth(provider,{oauth}), // Strategy,
          honey.logic.auth[oauth[provider].logic], // verify          
          oauth[provider])   // opts
      ))

}

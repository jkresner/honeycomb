'use strict'

module.exports = (app, mw) => {

  if (!mw.$.authd)
    mw.cache('authd', mw.res.forbid('anon', ({user}) => !user, { redirect: req => '/' }))


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

  var pwdFeatureOpts = Pwd(app, {password})
  Object.keys(password||{})
    .filter(feature => password[feature])
    .forEach(f => // 'login signup set reset'
      router.post(`/password/${f}`,
        mw.$.inflateMe,
        mw.auth.password(f, require('passport-local').Strategy, pwdFeatureOpts(f))
      ))


  Object.keys(oauth||{})
    .forEach(provider => router.get(`/${provider}/callback`,
        mw.$.inflateMe,
        mw.auth.oauth(          
          provider, 
          OAuth(provider,{oauth}), // Strategy,
          honey.logic.auth[oauth[provider].logic], // verify          
          oauth[provider])   // opts
      ))

}

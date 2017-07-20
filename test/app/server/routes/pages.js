module.exports = (app, mw) => 

  app

    .get('/',
      mw.$.session,
      mw.res.forbid('authd', ({user}) => user ? 'authd' : null, {
                    redirect: req => '/calendar' }),
      mw.$.setReturnTo,
      mw.$.page)


    .get('/calendar',
      mw.$.session,
      mw.res.forbid('anon', ({user}) => user ? null : '!authd', {
                redirect: req => '/?returnTo=/calendar' }),
      mw.$.page)


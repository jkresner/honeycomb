module.exports = (app, mw) => 
  
  mw.res.forbid('anon', 
    ({user}) => !user, 
    { redirect: req => `${honey.cfg('auth.loginUrl')||'/'}?returnTo=${req.url}` })

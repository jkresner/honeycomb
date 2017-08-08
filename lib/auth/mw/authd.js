module.exports = (app, mw) => 
  
  mw.res.forbid('anon', 
    ({user}) => user ? false : 'anon', 
    { returnTo: true } )

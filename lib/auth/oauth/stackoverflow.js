module.exports = () => ({

  defaults: {
    authorizationURL:   'https://stackexchange.com/oauth',
    tokenURL:           'https://stackexchange.com/oauth/access_token',
    scopeSeparator:     ','
  },

  // customOpts(opts) {
  //   if (!opts.key) throw Error("Config: oauth.stackoverflow.key required.")
  //   return opts
  // },

  customProto(Strategy) {
    Strategy.prototype.userProfile = function(token, done) {
      $log('getting so userProfile', token)
      Wrappers.Stackoverflow.getMyProfile(token, (e, _json, _raw) =>
        done(e, e ? null : { _json })
      )
    }
  },

  wrapperInject() {
    if (!Wrappers.Stackoverflow) Wrappers.Stackoverflow = require('../wrappers/stackoverflow')
    Wrappers.Stackoverflow.init()
    LOG('wrappers.init', 'init:Stackoverflow', 'Stackoverflow.inject.()')
  }


})

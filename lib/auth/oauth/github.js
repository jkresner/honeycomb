module.exports = () => ({


  defaults: {
    authorizationURL:   'https://github.com/login/oauth/authorize',
    tokenURL:           'https://github.com/login/oauth/access_token',
    scopeSeparator:     ',',
    customHeaders:      { "User-Agent": '{{required}}' }
  },


  customOpts(opts) {
    if (!opts.userAgent)
      throw Error(`Config: oauth.github.userAgent required.`.red)
    else
      opts.customHeaders["User-Agent"] = opts.userAgent

    return opts
  },


  customProto(Strategy) {
    // oauth2.useAuthorizationHeaderforGET(true)
    Strategy.prototype.userProfile = function(token, done) {
      var opts = this._opts
      Wrappers.GitHub.getMyProfile(token, (e, _json, _raw) => {
        if (e) return done(Error('Failed to fetch GitHub user profile'))

        var profile = { _json }
        if (!opts.emails)
          done(null, profile)
        else
          Wrappers.GitHub.getMyEmails(token, (e, emails) => {
            if (e) return done(Error('Failed fetching user emails'))
            profile._json.emails = emails
            done(null, profile)
          })
      })
    }

  },


  wrapperInject({_oauth2}) {
    if (!Wrappers.GitHub) Wrappers.GitHub = require('../wrappers/github')
    Wrappers.GitHub.init(_oauth2)
    LOG('wrappers.init', 'init:GitHub', 'GitHub.inject._oauth2')
  }


})

module.exports = () => ({


  defaults: {
    authorizationURL:   'https://www.linkedin.com/uas/oauth2/authorization',
    tokenURL:           'https://www.linkedin.com/uas/oauth2/accessToken',
    scopeSeparator:     ',',
    customHeaders:      { "x-li-format": 'json' },
    state:              true
  },


  customProto(Strategy) {
    Strategy.prototype.userProfile = function(token, done) {

      var opts = this._opts
      Wrappers.LinkedIn.getMyProfile(token, (e, _json, _raw) => {
        if (e) return done(Error('Failed to fetch LinkedIn user profile'))

        var profile = { _json }
        done(null, profile)
      })
    }

    // LinkedIn requires state parameter. It will return an error if not set.
    Strategy.prototype.authorizationParams = (options) => ({state:options.state})
  },


  wrapperInject({_oauth2}) {
    // (thanks auth0 team):
    // https://github.com/auth0/passport-linkedin-oauth2/blob/master/lib/oauth2.js
    // LinkedIn uses a custom name for the access_token parameter
    _oauth2.setAccessTokenName("oauth2_access_token")

    Wrappers.LinkedIn.init(_oauth2)
    LOG('wrappers.init', 'init:LinkedIn', 'LinkedIn.inject._oauth2')
  }


})

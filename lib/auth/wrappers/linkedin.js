var base = 'https://api.linkedin.com/v1'


var wrapper = {

  name: 'LinkedIn',

  init(api) {
    this.api = api || ({ get() { throw Error("Rewire by /oauth/linkedin") } })
  },

  getMyProfile(token, cb) {
    this.api.get(`${base}/people/~:(id,firstName,lastName,${config.auth.oauth.linkedin.profile})`, token, function(e, body, res) {
      if (e) return cb(e)
      try {
        cb(null, JSON.parse(body), body)
      } catch (e) {
        $log('LinkedIN: Failed parsing user profile', body, e)
        cb(e)
      }
    })
  }

}

module.exports = wrapper

var base = 'https://api.github.com'


var wrapper = {

  name: 'GitHub',

  init(api) {
    this.api = api || ({ get() { throw Error("Rewire by /oauth/github") } })
  },

  getMyEmails(token, cb) {
    this.api.get(`${base}/user/emails`, token, function(e, body, res) {
      cb(e, body ? JSON.parse(body) : null)
    })
  },

  getMyProfile(token, cb) {
    this.api.get(`${base}/user`, token, function(e, body, res) {
      if (e) return cb(e)
      try {
        cb(null, JSON.parse(body), body)
      } catch (e) {
        $log('GitHub: Failed parsing user profile', body, e)
        cb(e)
      }
    })
  }

}

module.exports = wrapper

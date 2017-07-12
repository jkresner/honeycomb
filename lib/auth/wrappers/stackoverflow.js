var wrapper = {

  name: 'Stackoverflow',

  init() {
    this.api = require('superagent')
    this.apiKey =
      _.get(config,'wrappers.stackoverflow.key') ||
      _.get(config,'auth.oauth.stackoverflow.key')
  },

  getMyProfile(token, cb)
  {
    var url = `https://api.stackexchange.com/2.2/me?site=stackoverflow&access_token=${token}`
    if (this.apiKey) url += `&key=${this.apiKey}`

    this.api.get(url, (e, res) => {
      LOG('wrpr.stackoverflow', `so.getMyProfile`, e, !res.ok || res.body)

      if (e || !res.ok || !res.body.items[0])
       return cb(e || Error(`Stackoverflow getMe failed`))

      cb(null, res.body.items[0], res.body)
    })
  },

  getTagBySlug(term, cb)
  {
    var encoded = encodeURIComponent(term)
    var url = `https://api.stackexchange.com/tags/${encoded}/wikis?site=stackoverflow`
    this.api.get(url, (e, res) => {
      LOG('wrpr.stackoverflow', `so.getTagBySlug:${term}`, e, !res.ok || res.body)

      if (e || !res.ok || !res.body.items[0])
       return cb(e || Error(`Stackoverflow tag ${term} not found`))

      var {tag_name,excerpt} = res.body.items[0]

      cb(null, {
        name: tag_name,
        short: tag_name,
        slug: tag_name,
        desc: excerpt,
        soId: tag_name,
        so: res.body.items[0]
      })
    })
  }

}

module.exports = wrapper

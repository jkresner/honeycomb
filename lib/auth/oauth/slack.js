var util = require('util')
, OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


function Strategy(options, verify) {
  options = options || {}
  options.authorizationURL = options.authorizationURL || 'https://slack.com/oauth/authorize'
  options.tokenURL = options.tokenURL || 'https://slack.com/api/oauth.access'
  options.scopeSeparator = options.scopeSeparator || ','
  this.profileUrl = options.profileUrl || "https://slack.com/api/auth.test?token="
  this.userInfoUrl = options.userInfoUrl || "https://slack.com/api/users.info?user="
  this._team = options.team

  OAuth2Strategy.call(this, options, verify)
  this.name = 'slack'
}


util.inherits(Strategy, OAuth2Strategy)


Strategy.prototype.userProfile = function(accessToken, done) {
  this.get(this.profileUrl, accessToken, (e, body, res) => {
    if (e) return done(e)

    try
    {
      var json = JSON.parse(body)

      if (!json.ok)
        return done(json.error ? json.error : body);

      var profile = { provider: 'slack', id: json.user_id }
      profile._raw = body;
      profile._json = json;

      this.get(`${this.userInfoUrl}${profile.id}&token=`, accessToken, function (e, body, res) {
        if (e) return done(err)

        var infoJson = JSON.parse(body)
        if (!infoJson.ok)
          return done(infoJson.error ? infoJson.error : body);

        Object.assign(profile._json, infoJson)

        done(null, profile)
      })

    }
    catch (e) {
      done(e)
    }

  })
}


Strategy.prototype.get = function(url, access_token, callback) {
  this._oauth2._request("GET", url + access_token, {}, "", "", callback)
}


Strategy.prototype.authorizationParams = function (options) {
  var team = options.team || this._team
  return team ? {team} : {}
}


module.exports = Strategy

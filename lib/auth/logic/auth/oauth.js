module.exports = function(DAL, Data, DRY) {
  
  var cfg = honey.cfg('auth.oauth')

  function validate(user, existing, provider, profile, tokens) {
      var {short} = cfg[provider]

      if (!cfg[provider])
        return `${provider} oauth not supported by this app`

      if (!user && cfg[provider].login !== true)
        return `${provider} oauth login not enabled for this app`

      if (!user && !existing && cfg[provider].signup !== true)
        return `${provider} oauth signup not enabled for this app`


      if (provider == 'github') {
        if (!tokens.token) return `Github user token required`
        if (!profile.login) return `Github login/username required`
        if (!profile.id) return `Github user id required`
        if (!profile.name) return `Github user account full name missing`

        if (cfg.github.emails) {
          if (!profile.emails || !profile.emails.length || profile.emails.length < 1)
            return `Github user emails missing`

          var verified = false
          for (var email of profile.emails)
            if (email.verified) verified = true

          if (!verified)
            return `No verified email belonging to github profile ${profile.login}`
        }
      }

      if (provider == 'facebook')  {   
        if (!tokens.token) return `Facebook token required`
        if (!profile.id) return `Facebook id required`
        if (!profile.picture || !profile.picture.data || 
            profile.picture.data.is_silhouette) 
          return `Facebook profile picture required`
      }

      if (user && user.auth && user.auth[short]) {
        var mini = Data.Project.minimal[short]
        var current = user.auth[short]
        if (mini(current) != mini(profile)) {
          if (cfg[provider].signup)
            return `Session [${mini(current)}] overwrite with [${mini(profile)}] disallowed`
          else
            return `OAuth fail. Unlink existing ${provider} [${mini(current)}] before you can link [${mini(profile)}]`
        }
      }
    }

  return {

    validate,

    exec(provider, profile, tokens, done) {
      var {short} = cfg[provider]
      DRY.userByAuth(this.user, short, profile, (e, existing) => {
        if (e) return done(e)

        var inValid = validate(this.user, existing, provider, profile, tokens)
        if (inValid) return done(DRY.Unauthorized(inValid))

        assign(this,{existing})

        var fn = ''        

        if (this.user)
          fn = 'linkOAuth'

        else if (existing)
          fn = 'loginOAuth'

        else
          fn = 'signupOAuth'

        DRY[fn](this, short, provider, profile, tokens, done)

      })
    },

    project: Data.Project.session

  }

}

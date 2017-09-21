module.exports = (DAL, Data, DRY) => ({


  validate(user, existing, provider, profile, tokens) {
    let cfg = honey.cfg('auth.oauth')
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

        let verified = false
        for (let email of profile.emails)
          if (email.verified) verified = true

        if (!verified)
          return `No verified email belonging to github profile ${profile.login}`
      }
    }

    if (provider == 'facebook')  {
      let pic = (profile.picture||{}).data
      if (!tokens.token) return `Facebook token required`
      if (!profile.id) return `Facebook id required`
      if (!profile.email) return `Facebook email required`
      if (!pic || pic.is_silhouette) return `Facebook profile picture required`
    }

    if (user && user.auth && user.auth[short]) {
      var mini = Data.Project.minimal[short]
      var current = user.auth[short]
      if (mini(current) != mini(profile)) {
        if (cfg[provider].signup)
          return `[${mini(current)}] Session overwrite disallowed with [${mini(profile)}] `
        else
          return `OAuth fail. Unlink existing ${provider} [${mini(current)}] before you can link [${mini(profile)}]`
      }
    }
  },


  exec(existing, provider, profile, tokens, cb) {
    // $log(`oauth.${provider}`.blue, {existing:!!existing}, profile)

    let {short} = honey.cfg('auth.oauth')[provider]
    let op = 'signup'

    if (this.user)
      op = 'link'
    else if (existing)
      op = 'login'

    assign(this,{existing})

    DRY.auth[`${op}OAuth`](this, short, provider, profile, tokens, (e,r) => {
      if (r && this.analytics) {
        let alias = _.pick(r,["_id","name"])
        assign(this.analytics, { event: `${op}:oauth:${short}`, alias, data: { user:alias, profile } })
      }
      cb(e,r)
    })
  },


  // project: null


})

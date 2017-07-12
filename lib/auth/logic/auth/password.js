module.exports = function(DAL, Data, DRY) {
  // var cfg = global.config.auth.password

  function validate(user, email, password) {
    if (!email) return 'Email required'
    if (!password) return 'Password required'
  }

  return {

    validate,


    exec({email, password}, done) {
      var inValid = validate(this.user, email, password)
      if (inValid) return done(null, false, inValid)
      var q = Data.Query.existing.byEmails([email])
      DAL.User.getByQuery(q, {select:'emails.value email name auth.password'}, (e, existing) => {
        if (e) return done(e)
        if (!existing) return done(null, false, `No user found by email ${email}`)
        var {auth} = existing
        // if (!cfg.master || !password.match(cfg.master)) {
          if (!auth.password || !honey.libs.bcrypt.compareSync(password, auth.password.hash))
            return done(null, false, `Incorrect password`)
        // }

        DRY.loginLocal(this, existing, done)
      })
    },


    project: Data.Project.session

  }
}

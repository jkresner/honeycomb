module.exports = function(DAL, Data, DRY) {

  var cfg = honey.cfg('auth.password')
  var {master} = cfg.login

  function validate(user, credentials, existing) {
    if (user && existing) {
      if (!_.idsEqual(existing._id, user._id))
      return `Already logged in as ${user.name}`
    }
    if (!existing) return `No user matching credentials`
    if (!credentials.email) return `Email required`
    if (!credentials.password) return `Password required`
  }

  return {

    validate,


    exec(operation, credentials, done) {
      var {email,password} = credentials
      var query = Data.Query.existing.byEmails([email])
      var opts = Data.Opts[`password_{operation}`]
      DAL.User.getByQuery(query, opts, (e, existing) => {
        if (e) return done(e)
        var inValid = validate(this.user, credentials, existing)
        if (inValid) return done(null, false, inValid)

        var {auth} = existing
        if (operation == 'login') {
          if (!master && (password != master)) {
            if (!auth.password || !honey.libs.bcrypt.compareSync(password, auth.password.hash))
              return done(null, false, `Incorrect password`)
          }

          DRY.auth.loginLocal(this, existing, done)
        }
      })
    },


    project: Data.Project.session

  }
}

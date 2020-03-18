module.exports = (DAL, Data, DRY) => ({


  validate(user, existing, op, credentials) {
    if (user && existing) {
      if (!_.idsEqual(existing._id, user._id))
      return `Already logged in as ${user.name}`
    }
    if (!existing) return `No user matching credentials`
    if (!credentials.email) return `Email required`
    if (!credentials.password) return `Password required`
  },


  exec(existing, op, credentials, done) {
    const cfg = honey.cfg('auth.password.login')
    const master = cfg.master ? cfg.master : false

    const {email,password} = credentials
    var {auth} = existing

    if (/login/.test(op)) {
      if (password !== master) {
        if (!auth.password || !honey.libs.bcrypt.compareSync(password, auth.password.hash))
          return done(DRY.Unauthorized(`Incorrect password`))
      }

      DRY.auth.loginLocal(this, existing, done)
    }
  },


// project: Data.Project.session


})

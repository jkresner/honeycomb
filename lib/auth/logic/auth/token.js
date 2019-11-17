module.exports = function(DAL, Data, DRY) {

  return {

    validate(user, token, _id, existing) {
      let claims = DRY.auth.sts.jwt.verify(token)
      if (!claims) return `Bad token`

      if (claims._id != _id) return `Bad link`

      if (user && existing) {
        if (!_.idsEqual(existing._id, user._id))
        return `Already logged in as ${user.name}`
      }
    },


    exec(token, _id, existing, done) {
      var cfg = honey.cfg('auth.token')

      DRY.auth.loginLocal(this, existing, done)
    },


    // project: Data.Project.session


  }
}

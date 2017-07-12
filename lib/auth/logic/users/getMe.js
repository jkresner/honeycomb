module.exports = ({User}, Data, Shared, Lib) => ({

  validate(user) {
    if (!user)
      return `Must be authenticated to get user info`
  },


  exec(done) {
    User.getById(this.user._id, done)
  },


  project: Data.Project.me


})








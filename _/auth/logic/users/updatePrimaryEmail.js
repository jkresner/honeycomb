module.exports = function({User}, Data, DRY) {


  return {


    validate(user, email) {
      if (!user)
        return `Must be authenticated to update primary email`

      var existing = _.find(user.emails, o => _.idsEqual(email._id,o._id))
      if (!existing)
        return `Failed to set primary email[${email._id}]. Does not belog to you[${user._id}]`

      if (existing.disabled)
        return `Failed to set disabled primary email[${email._id}]`

      if (existing.primary)
        return `${existing.value} is already your primary email`
    },


    exec(email, done) {

      User.getById(this.user._id, '_id emails log', (e, user) => {
        var {_id,emails,log} = user
        for (var o of emails) o.primary = _.idsEqual(email._id,o._id)

        log = DRY.logAct(user,'update:primaryEmail', user)

        User.updateSet(_id, {emails,log}, done)
      })

    },


    project: Data.Project.me


  }


}

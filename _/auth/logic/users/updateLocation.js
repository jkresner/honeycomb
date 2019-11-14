module.exports = function(DAL, Data, DRY) {


  return {


    validate(user, data) {
      if (!user)
        return `Not authenticated`

      if (!data) return "locationData required"
      if (!data.geometry || !data.geometry.location)
        return "locationData geometry required"
      if (!data.formatted_address) return "locationData address required"

    },


    exec(data, done) {

      // User.getById(this.user._id, '_id emails log', (e, user) => {
      //   var {_id,emails,log} = user
      //   for (var o of emails) o.primary = _.idsEqual(email._id,o._id)
      // })

      // var timeZoneTimestamp = moment().unix()
      // Wrappers.Timezone.getTimezoneFromCoordinates(locationData.coordinates, timeZoneTimestamp, (e,r) => {
      //   if (e) return cb(e)

      //   var updates = {
      //     location: {
      //       name: locationData.formatted_address,
      //       shortName: locationData.name,
      //       timeZoneId: r.raw_response.timeZoneId,
      //     },
      //     'raw.locationData': locationData
      //   }

      //   updateAsIdentity.call(this, updates, null, cb)
      // })

    },


    project: Data.Project.me


  }


}

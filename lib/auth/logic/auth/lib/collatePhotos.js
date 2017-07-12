// var crypto = require('crypto')
// var md5 = function(str, encoding) {
//   return crypto
//     .createHash('md5')
//     .update(str, 'utf8')
//     .digest(encoding || 'hex')
// }

module.exports = () =>


function(existing, emails, gh) {
  if (existing.length > 0)
    $log(`ap[${existing.length}]photos`.yellow, existing)

  if (gh && gh._json && gh._json.gravatar_id && !_.find(existing,(ph)=>ph.value==gh._json.gravatar_id))
    existing.push({value:gh._json.gravatar_id,type:'github'})

  for (var email of emails) {
    var value = md5(email.value)
    if (!_.find(existing,(ph)=>ph.value==value))
      existing.push({value,type:'gravatar'})
  }

  var existingPrimary = _.find(existing,(em)=>em.primary)
  if (!existingPrimary) {
    var githubPhoto = _.find(existing,(ph)=>ph.type=='github')
    if (githubPhoto) githubPhoto.primary = true
    else {
      var primaryEmailMd5 = md5(_.find(emails,(em)=>em.primary).value)
      var primaryEmailPhoto = _.find(existing,(ph)=>ph.value==primaryEmailMd5)
      if (primaryEmailPhoto) primaryEmailPhoto.primary = true
    }
  }

  return existing
}

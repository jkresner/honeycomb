var cfg = global.config.auth.oauth
module.exports = ({User}, Data, {Forbidden}, Lib) => ({


  validate(user, original, provider) {
    if (!cfg[provider])
      return `Auth provider ${provider} not supported by this app`

    if (!user || !user._id || 
                    user._id.toString() != original._id.toString())
      return `Authenticated user not recognized`

    if (cfg[provider].unlink === false)
      return `${provider} unlink not support by this app`

    if (!original.auth[cfg[provider].short])
      return `User[${original._id}] has no existing ${provider} profile linked`
  },


  exec(original, provider, cb) {
    var {short} = cfg[provider]
    // console.log('unlink.unset'.green, Data.Project.session)
    User.updateUnset(original._id, [`auth.${short}`], cb)
  },


  project: Data.Project.me


})

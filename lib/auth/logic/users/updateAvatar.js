module.exports = function({User}, Data, DRY) { return {


  validate(user, avatar) {
    let types = ['gravatar','facebook','github']
    let {type,value} = avatar
    
    if (!type) return `Type required`
    if (types.indexOf(type) == -1) return `Type ${type} not supported`
    if (value.indexOf('https://') != 0) return `Https img url required`
  },


  exec(avatar, done) {    
    let {_id,photos,log} = this.user

    if (!avatar._id) {
      avatar._id = User.newId()
      photos = (photos||[]).concat(avatar)
    }

    for (var p of photos) 
      p.primary = _.idsEqual(avatar._id, p._id)

    log = DRY.logAct(this.user,'update:avatar', this.user)

    User.updateSet(_id, {photos,log}, done)
  },


  project: Data.Project.me


}}

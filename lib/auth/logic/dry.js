function touchMeta(meta, action, user) {
  if (!meta)
    meta = { activity:[] }
  
  var touch = { action, _id: honey.projector._.newId(), 
                     by: { _id: user._id, name: user.name } }
  
  meta.lastTouch = touch
  meta.activity.push(touch)
  return meta
}

function setProfileTokens(profile, token, refresh) {
  var {appKey} = config.auth
  _.set(profile,`tokens.${appKey}.token`, token)
  if (refresh) _.set(profile,`tokens.${appKey}.refresh`, refresh)
  return profile
}


module.exports = ({User}, Data) => ({
  
  touchMeta,

  getCohortProps() {
    return {}
  },


  linkOAuth({user,existing}, key, provider, profile, tokens, done) {
    LOG('auth.oauth', `oauth:${key}.link`, `[${user._id}] ${user.name}: ${JSON.stringify(profile)}`)

    //-- At this point we only take care of user.auth
    //-- But at some point we should get all the logic going
    //-- for emails + photos etc.
    var {auth} = this.mergeOAuth(user, key, provider, profile, tokens)
    User.updateSet(user._id, {auth}, done)
    // var trackData = select.analyticsLink(user, provider, profile)
    // analytics.event(`link:${short}`, user, trackData)
  },


  login(sessionID, session, login, {auth, emails, photos}, done) {

    var update = { auth, emails, photos }

    update.cohort = this.getCohortProps(login, session)

    var aliases = config.auth.appKey == 'apcom' ? [sessionID] : []
    update.cohort.aliases = _.union(update.cohort.aliases||[],aliases)

    update.meta = touchMeta(login.meta, 'login', login)

    // $log('honey.auth.login', login._id, update)
    User.updateSet(login._id, update, (e, r) => {
      LOG('auth.login', 'login', `[${login._id}] ${login.name}`)
      done(e, r)
      // var trackData = select.analyticsLogin(user,sessionID)
      // analytics.alias(user, sessionID, 'login', trackData)
    })

  },

  
  loginLocal({sessionID, session}, existing, done) {
    var updates = existing

    LOG('auth.local', `local:pwd.login`, `[${existing._id}] existing.name`)
    this.login(sessionID, session, existing, updates, done)
  },


  loginOAuth({sessionID, session, existing}, key, provider, profile, tokens, done) {
    var updates = this.mergeOAuth(existing, key, provider, profile, tokens)
    
    LOG('auth.oauth', `oauth:${key}.login`, `[${existing._id}] ${profile.id} ${profile.login||profile.username||profile.displayName||profile.name}`)
    this.login(sessionID, session, existing, updates, done)
  },


  mergeOAuthEmails(existing, oauthEmails) {
    var {emails} = existing
    if (!emails) emails = oauthEmails
    else {
      for (var oauthEmail of oauthEmails)
        if (!_.find(emails, o=>o.value==oauthEmail.value)) emails.push(oauthEmail)
    }
    return emails
  },


  mergeOAuthPhotos(existing, oauthPhotos) {
    var {photos} = existing
    if (!photos) photos = oauthPhotos
    else {
      for (var oauthPhoto of oauthPhotos)
        if (!_.find(photos, o=>o.value==oauthPhoto.value)) photos.push(oauthPhoto)
    }
    return photos
  },


  mergeOAuth(existing, key, provider, profile, {token,refresh}) {
    var {Project} = Data.auth
    if (Project.emails[key])
      var emails = this.mergeOAuthEmails(existing, Project.emails[key](profile,existing))
    
    if (Project.photos[key])
      var photos = this.mergeOAuthPhotos(existing, Project.photos[key](profile,existing))

    var auth = existing ? existing.auth : {}
    var mergedProfile = _.extend(_.get(existing||{},`auth.${key}`)||{},profile)
    auth[key] = setProfileTokens(mergedProfile,token,refresh)

    return {emails,photos,auth}
  },


  signup(sessionID, session, signup, done) {
    // var maillists = _.union(session.maillists||[],['AirPair Developer Digest'])
    // var primaryEmail = _.find(signup.emails, email => email.primary)
    // primaryEmail.lists = maillists
    signup.cohort = this.getCohortProps(null, session)
    signup.cohort.aliases = config.auth.appKey == 'apcom' ? [sessionID] : []
    signup.meta = touchMeta(null, 'signup', signup)

    User.create(signup, (e, user) => {
      LOG('auth.signup', `signup`, `${JSON.stringify(user)}`)
      done(e, user)
      //-- Send an email ??
      // $log('signup'.cyan, signup, user)
      // var trackData = select.analyticsSignup(user,sessionID)
      // analytics.alias(user, sessionID, 'signup', trackData)
    })
  },


// /localSignup(email, password, name, done) {
//   if (this.user) return done(Error(`Signup fail. Already logged in as ${this.user.name}`))

//   User.getManyByQuery(query.existing.byEmails([email]), (e, existing) => {
//     if (e) return done(e)
//     if (existing.length == 1) return done(Error(`Signup fail. Account with email already exists. Please reset your password.`))
//     if (existing.length > 1) return done(Error(`Signup fail. Multiple user accounts associated with ${email}. Please contact team@airpair.com to merge your accounts.`))

//     var user    = {name}
//     user.emails = [{value:email,primary:true,verified:false}]
//     user.auth   = {
//       password:   { hash: select.passwordHash(password) } // password is hased in the db
//     }

//     if (logging) $log('Auth.localSignup', this.sessionID, user.name)
//     _createUser(this.sessionID, this.session, user, done)
//   })
// }


  signupOAuth({sessionID,session}, key, provider, profile, {token,refresh}, done) {
    var {Project} = Data.auth
    var user = Project.odata[key](profile)
    user._id = User.newId()  // So touch and analytics works
    user.auth = {}
    user.auth[key] = setProfileTokens(profile, token, refresh)
    LOG('auth.oauth', `oauth:${key}.signup`, `[${user._id}] ${profile.id} ${profile.login||profile.username||profile.displayName||profile.name}`)
    this.signup(sessionID, session, user, done)
  },


  userByAuth(user, key, data, cb) {
    var {Query} = Data.auth

    if (!Query.existing[key])
      throw Error(`getByAuth fail: Exising query for User.auth.${key} not defined`)

    var existsQuery = Query.existing[key](data)
    if (user) {
      for (var prop in existsQuery)
        if (_.get(user,prop) === existsQuery[prop]) cb(null, user)
    }

    User.getByQuery(existsQuery, cb)
  }




})
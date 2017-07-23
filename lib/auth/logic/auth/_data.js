var View = {
  session:   '_id name scope',
  login:     'name linked emails photos meta cohort'
}

function newId() {
  return honey.projector._.newId()
}

var project = {
  primaryEmail: user => user && _.find(user.emails, o => o.primary),
  primaryPhoto: user => user && _.find(user.photos, o => o.primary),
  emails: {
    gh(profile, existingUser) {
      var existingPrimary = project.primaryEmail(existingUser)
      return (profile.emails||[]).map(o => ({
        _id:        newId(),
        primary:    !existingPrimary && o.primary,
        value:      o.email,
        verified:   o.verified,
        origin:     'oauth:github'  }))
    },
    fb(profile, existingUser) {
      var existingPrimary = project.primaryEmail(existingUser)
      return [{
        _id:        newId(),
        primary:    !existingPrimary,
        value:      profile.email,
        verified:   true,
        origin:     'oauth:facebook'  }]
    }
  },
  photos: {
    gh(profile, existingUser) {
      var existingPrimary = project.primaryPhoto(existingUser)
      var photos = [{ value:profile.avatar_url, type:'github',
                      primary:!existingPrimary && !profile.gravatar_id }]
      if (profile.gravatar_id && profile.gravatar_id != '')
        photos.push({ value:profile.gravatar_id, type:'gravatar',
                      primary:!existingPrimary })
      return photos
    },
    fb(profile, existingUser) {
      var existingPrimary = project.primaryPhoto(existingUser)
      var photos = [{ value:profile.picture.data.url, type:'facebook',
                      primary:!existingPrimary }]
      
      return photos
    }    
  },
  minimal: {
    al: p => `${p.id} ${p.angellist_url}`,
    bb: p => `${p.id} ${p.user.username}`,
    fb: p => `${p.id} ${p.name}`,
    gh: p => `${p.id} ${p.login}`,
    gp: p => `${p.id} ${p.displayName}`,
    in: p => `${p.id} ${p.firstName} ${p.lastName}`,
    // sl: p => `${p.id} ${p.displayName}`,
    so: p => `${p.user_id} ${p.display_name}`,
    tw: p => `${p.id} ${p.screen_name}`,
  },
  odata: {
    gp(p) {
      if (!p.emails) $log('Google oauth data has no .emails', p)

      // if (!p.displayName && p.name && p.name.constructor == String) {
      //   p.displayName = p.name
      //   delete p.name
      // }

      var name = p.displayName
      // var email = p.email || p.emails[0].value
      // var emailVerified = p.verified_email || p.verified
      var emails = []
      if (!p.emails || p.emails.length == 1)
        emails.push({_id:newId(),value:email,primary:true,verified:emailVerified,origin:'oauth:google'})
      else {
        for (var em of p.emails)
          emails.push({_id:newId(),value:em.value,verified:false,primary:false,origin:'oauth:google'})
      }
      var photos = []

      // p.email = email

      return {name,emails,photos}
    },
    fb(p, user) {
      var {name,id} = p
      var emails = project.emails.fb(p, user)
      var photos = project.photos.fb(p, user)

      return {name,id,emails,photos}
    },
    al(p) {
      var username = p.angellist_url.replace('https://angel.co/','')
      return {profile: _.extend({username}, _.omit(p,'facebook_url','behance_url','dribbble_url')) }
    },
    sl(p) {
      var username = p.info.user.name
      var selected = util.selectFromObject(p.info.user,['id','real_name','tz_offset','profile.email'])
      return { profile: _.extend({username},selected) }
    },
    gh(p, user) {
      var name = p.name || p.login
      var emails = project.emails.gh(p, user)
      var photos = project.photos.gh(p, user)

      // var email = user ? user.email : (_.find(p.emails, o => o.primary && o.verified)||{}).email
      // var emailVerified = email ? true : false

      var username = p.login
      return {name,emails,photos,username}
    },
    tw(p) { return {profile:p} },
    in(p) { return {profile:p} },
    bb(p) { return {profile:p} },
    so(p) { return {profile:p} },
  }
}


var Query = {

  existing: {
    byEmails(emails) {
      emails = emails.map(em => em.toLowerCase())
      return { '$or': [
        { 'email' : { $in: emails } },
        { 'emails.value' : { $in: emails } },
        { 'auth.gp.emails.value' : { $in: emails } },
        { 'auth.gp.email' : { $in: emails } },
        { 'auth.fb.email' : { $in: emails } },        
        { 'auth.gh.email' : { $in: emails } },
        { 'auth.gh.emails.email' : { $in: emails } },
      ]}
    },
    gp(profile) {
      var emails = _.map(profile.emails||[], 'value')
      if (emails.length == 0) {
        if (!profile.email) throw Error("Google profile has no email")
        else emails = [profile.email.toLowerCase()]
      }
      var q = Query.existing.byEmails(emails)
      q['$or'].push({'auth.gp.id':profile.id})
      return q
    },
    gh(profile) {
      var emails = _.map(profile.emails||[], 'email')
      var q = emails.length > 0 ? Query.existing.byEmails(emails) : { '$or': [] }
      q['$or'].push({'auth.gh.id':profile.id})
      return q
    },
    fb(profile) {
      var emails = [profile.email]
      var q = Query.existing.byEmails(emails)
      q['$or'].push({'auth.fb.id':profile.id})
      return q
    },
    al: profile => ({'auth.al.id':profile.id}),
    bb: profile => ({'auth.bb.user.username':profile.user.username}),
    in: profile => ({'auth.in.id':profile.id}),
    sl: profile => ({'auth.sl.id':profile.id}),
    so: profile => ({'auth.so.user_id':profile.user_id}),
    tw: profile => ({'auth.tw.id':profile.id}),
  },


  // select(fieldsSetName) {
  //   return { select: fields[fieldsSetName] }
  // }

}


module.exports = {View,Query,Projections: () => project }

module.exports = function(DAL, Data, DRY) { return {


  validate(user, email, existing) {
    if (user && existing 
             && !_.idsEqual(existing._id, user._id) )
      return `Already logged in as ${user.name}`

    // should consider something like if the email is marked as SPAM
  },


  exec(email, existing, done) {
    let {expiresIn,url} = honey.cfg('auth.token.onetime')
    let {_id,name} = existing
    let claims = {email,_id,name}
    let token = DRY.auth.sts.jwt.generate(claims, expiresIn)

    let magic = honey.cfg('http.host') + `/auth/${url}/${_id}/${token}`
    let mail_tmpl = 'user_onetime_login'
    let mail_data = assign({token},claims,{url_magic:magic})
    
    // console.log('mail_data', mail_data)
    COMM.toUser(claims)
        .by({ses:1})
        .send(mail_tmpl, mail_data, (e1, m) => {
            done(e1)
      // doc.sent[m.to._id] = [{ _id: m._id, key:m.key, msgId: m.messageId, to: m.messageTo }]
        // assign(doc, {data})
        // raw.push()

        // DAL.Comm.create(doc, (e2, comm) => {
          // let log = DRY.sys.logAct(r, `sys.welcome`)
          // log.comm = assign(log.comm||{},{'welcome': comm._id})
          // DAL.User.updateSet(r._id, {log}, {select:'_id'}, (e3, r3) => {
            // done(e3, comm, assign(r3,{log}), [m.text])
          // })
        // })
        })
  },


  project: (r) => ({success:true})


}}

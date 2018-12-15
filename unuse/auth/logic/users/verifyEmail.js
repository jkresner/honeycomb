module.exports = (DAL, Data, DRY) => ({
  

  validate() {

  },


  exec(hash, done) {
    // svc.searchOne({ email:this.user.email }, null, (e,r) => {
  //   if (e || !r) {
  //     $log('verifyEmail.error'.red, e, r)
  //     return cb(e,r)
  //   }
  //   if (r.local.changeEmailHash == hash) {
  //     var trackData = { type: 'emailVerified', email: this.user.email }
  //     updateAsIdentity.call(this, { emailVerified: true }, trackData, cb)
  //   }
  //   else
  //     cb(Error("e-mail verification failed, hash is not valid"))
  // })
  },


  project: Data.Project.session

  

})
module.exports = (app, mw) =>

  mw.data.recast('user','user._id',{required:false,merge:true})

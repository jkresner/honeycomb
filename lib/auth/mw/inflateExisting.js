module.exports = (app, mw) =>

  mw.data.recast('user','params.user', {
    required: true,
    dest: 'existing'
  })

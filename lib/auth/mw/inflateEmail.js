module.exports = (app, mw) =>

  mw.data.recast('user','body.email', {
    required: true,
    queryKey: 'emails.value', 
    dest: 'existing'
  })

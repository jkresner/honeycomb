module.exports = (app, mw) => {

  var cfg = honey.cfg('auth')


  var api = app.API('users')
    .uses('authd inflateMe')
    .get({ getMe:                   '' })

  if (!cfg.api || !cfg.api.users) return

  var {users} = cfg.api


  if (users.updatePrimaryEmail)
    api.put({ updatePrimaryEmail:    'body'})

  if (users.unlinkOAuth)
    api.put({unlinkOAuth:          'user params.provider' })

}

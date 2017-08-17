SCREAM = require('screamjs')

opts =
  login:
    accept:            'application/json'
    url:               '/auth/test-login'
    logic:             'oauth'
    handler: (data, cb) ->
      profile = FIXTURE.clone("users.#{data.key}").auth.gh
      profile.emails = FIXTURE.wrappers[data.oaEmails] if data.oaEmails
      token = _.get(profile,"tokens.#{config.auth.appKey}.token") || "test"
      opts.login.fn.call @, 'github', profile, {token}, cb
  oauth:
    url:               '/auth/test-oauth'
    logic:             'oauth'
    handler: (data, cb) ->
      {_json,provider} = data
      opts.oauth.fn.call @, provider, _json, {token:'test'}, cb


SCREAM(opts).run (done) ->
  if !/(all|auth)/.test(OPTS.config.specs)
    done(->)
  else
    {Configure} = require('../lib/index')
    config = Configure(__dirname+'/app/server', 'test', true)
    config.routes.auth.test = { on: true, login: opts.login, oauth: opts.oauth }
    require('./app/server/app').run(config, done)

test =
  auth:
    login:             { fnName: 'oauth', url: '/auth/test/login' }
    oauth:             { fnName: 'oauth', url: '/auth/test/oauth' }


opts =
  login:
    clearSessions: true
    test: test.auth.login
    fn: (data, cb) ->
      profile = FIXTURE.clone("users.#{data.key||data}").auth.gh
      profile.emails = FIXTURE.wrappers[data.oaEmails] if data.oaEmails
      token = _.get(profile,"tokens.#{config.auth.appKey}.token") || "test"
      config.test.auth.login.fn.call @, 'github', profile, {token}, cb
  oauth:
    test: test.auth.oauth
    fn: (data, cb) ->
      {_json,provider} = data
      token = "test" # _.get(profile,"tokens.#{config.auth.appKey}.token") || "test"
      # $log('oauth'.white, config.test.auth.oauth, data)
      config.test.auth.oauth.fn[provider].call @, provider, _json, {token}, cb



require('screamjs')(opts).run (done) ->
  {Configure} = require('../lib/index')
  config = Configure(__dirname+'/app/server', 'test', true)
  config.test = test
  require('./app/server/app').run(config, done)

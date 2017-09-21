SCREAM                 = require('screamjs')


OPTS =
  setup:
    done:              require('./setup')
  login:
    accept:            'application/json'
    url:               '/auth/test-login'
    logic:             'oauth'
    handler: (data, cb) ->
      usr = FIXTURE.users[data.key]
      existing = usr if usr._id?
      token = _.get(usr, "auth.gh.tokens.#{config.auth.appKey}.token") || "test"
      OPTS.login.fn.call @, existing, 'github', usr.auth.gh, {token}, cb
  oauth:
    url:               '/auth/test-oauth'
    logic:             'oauth'


SCREAM(OPTS).run (done) ->
  {Configure} = require('../lib/index')
  config = Configure(__dirname+'/app/server', 'test', true)
  config.routes.auth.test = { on: true, login: OPTS.login, oauth: OPTS.oauth }
  require('./app/server/app').run(config, done)

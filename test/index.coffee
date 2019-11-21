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
  stubConfig: 
    log:
      appKey:              'APPTESTK'
      errors:  mail: 
        to:                'jk <jk@air.test>,abc <sbc@test.com>'
        sender:            'ERR <team@test.com>'
    comm:
      mode:              'stub'
      transports:        ['ses','smtp']
      sender:
        noreply:  mail:  'Honey <noreply@honey.stub>'        
    templates:
      dirs:              {}
      engines:           'hbs,marked'
    wrappers:
      ses:
        accessKeyId:     '--'
        secretAccessKey: '--' 
      smtp:
        service:         '--'
        auth: 
          user:          '--'
          pass:          '--' 


SCREAM(OPTS).run (done) ->
  {Configure} = require('../lib/index')
  config = Configure(__dirname+'/app/server', 'test')
  config.routes.auth.test = { on: true, login: OPTS.login, oauth: OPTS.oauth }
  require('./app/server/app').run(config, done)

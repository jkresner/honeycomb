const Configure = require(join(process.cwd(),'/lib/app/configure'))
const quiet = process.env.LOG_QUIET
const env_temp = {}

module.exports = () => {

  before(function() {
    for (let prop in process.env) env_temp[prop] = process.env[prop]
  })

  after(function() {
    for (let prop in process.env) delete process.env[prop]
    for (let prop in env_temp) process.env[prop] = env_temp[prop]
  })

  beforeEach(function() {
    for (let prop in process.env) delete process.env[prop]
    if (quiet) process.env.LOG_QUIET = quiet
    process.env.HTTP_STATIC_FAVICON_ROOT = 'ico'
  })


  IT('Configure fails on unset {{required}} value', function() {
    var fn = () => Configure({}, 'dev', {dotEnv:false})
    expect(fn).to.throw(Error, /Configure failed. process.env./)
    DONE()
  })


  IT('Defaults with barest env vars applied', function() {
    process.env.COMM_SENDERS_ERR_EMAIL = 'err@test.com'
    process.env.LOG_APPKEY = 'test2'
    process.env.LOG_ERRORS = '{{undefine}}'
    process.env.MODEL_DOMAIN_MONGOURL = 'mongodb://ghtest2/db'
    process.env.MIDDLEWARE_SESSION_STORE_COLLECTION = 'sessions-test2'
    
    var cfg2 = Configure({}, 'dev', {dotEnv:false})
    expect(cfg2.env).to.equal('dev')
    expect(cfg2.http.port).to.equal(3333)
    expect(cfg2.http.host).to.equal('http://localhost:3333')
    expect(cfg2.http.static.dirs[0]).to.inc('/public')
    expect(cfg2.model.domain.mongoUrl).to.equal('mongodb://ghtest2/db')
    expect(cfg2.middleware.session.store.collection).to.equal('sessions-test2')
    DONE()
  })


  IT('{{undefine}} auth and comm sections from appConfig', function() {
    var appCfg3 = { auth: undefined, http: {}, comm: "{{undefine}}", log: undefined }
    process.env.MODEL_DOMAIN_MONGOURL = 'mongodb://ghtest3/db'
    process.env.MIDDLEWARE_SESSION_STORE_COLLECTION = 'sessions-test3'

    var cfg3 = Configure(appCfg3, 'dev', {dotEnv:false})
    expect(cfg3.auth).to.be.undefined
    expect(cfg3.http.host).to.equal('http://localhost:3333')
    expect(cfg3.model.domain.mongoUrl).to.equal('mongodb://ghtest3/db')
    expect(cfg3.middleware.session.store.collection).to.equal('sessions-test3')
    DONE()
  })


  IT('{{undefine}} log.auth section from env var', function() {
    var appCfg4 = { auth: undefined, model: undefined, comm: undefined, middleware: undefined }
    process.env.LOG_IT_AUTH = '{{undefine}}'
    process.env.LOG_ERRORS = '{{undefine}}'
    process.env.LOG_APPKEY = 'test4'

    var cfg4 = Configure(appCfg4, 'dev', {dotEnv:false})
    expect(cfg4.auth).to.be.undefined
    expect(cfg4.model).to.be.undefined
    expect(cfg4.log).to.exist
    expect(cfg4.log.it).to.exist
    expect(cfg4.log.it.auth).to.be.undefined
    DONE()
  })


  IT('Configure works ok with cfg.init logging on', function() {
    var appCfg5 = { auth: undefined, comm: undefined, log: { errors:undefined } }
    process.env.LOG_APPKEY = 'test5'
    process.env.LOG_IT_CFG_INIT = 'white'
    process.env.MODEL_DOMAIN_MONGOURL = 'mongodb://ghtest0/db'
    process.env.MIDDLEWARE_SESSION_STORE_COLLECTION = 'sessions-test0'
    var cfg0 = Configure(appCfg5, 'dev', {dotEnv:false})
    DONE()
  })


  IT('merge app.json on top of defaults', function() {
    let appJson = { 
      comm: undefined, 
      log: { it: { app: false } , errors: undefined }, 
      model: undefined, 
      middleware: undefined 
    }
    process.env.LOG_APPKEY = 'test7'
    let cfg = Configure(appJson, 'dev', {dotEnv:false})
    expect(cfg.log.it.app).to.equal(false)
    DONE()
  })

  
  IT('merge app.json with auth section on top of defaults', function() {
    let appJson = { 
      auth: { appKey: 'tstAuth', 
              password: undefined }, 
      log: { appKey: 'test.auth.cfg', it: { app: false } , errors: undefined }, 
    }
    process.env.MODEL_DOMAIN_MONGOURL = 'mongodb://host:3333'
    process.env.MIDDLEWARE_SESSION_STORE_COLLECTION = 'test.auth.cfg'
    process.env.AUTH_TOKEN_JWT_SECRET = 'shhhhhhhh'
    process.env.AUTH_OAUTH_GITHUB_CLIENTSECRET = 'gshhhhhhhh'
    process.env.AUTH_OAUTH_GITHUB_CLIENTID = 'gshhhhhhhhid'
    process.env.AUTH_OAUTH_GITHUB_USERAGENT = 'test-uagent-gh'
    
    let cfg = Configure(appJson, 'dev', {dotEnv:false})
    expect(cfg.log.it.app).to.equal(false)
    expect(cfg.log.appKey).to.equal('test.auth.cfg')
    expect(cfg.auth).to.exist
    expect(cfg.auth.password).to.be.undefined
    expect(cfg.auth.token.jwt).to.exist
    expect(cfg.auth.oauth.github.short).to.equal('gh')
    expect(cfg.auth.oauth.github.login).to.equal(true)
    expect(cfg.auth.oauth.github.signup).to.equal(true)
    expect(cfg.auth.oauth.github.emails).to.equal(true)
    expect(cfg.auth.oauth.github.logic).to.equal('oauth')
    expect(cfg.auth.oauth.github.clientID).to.equal('gshhhhhhhhid')
    expect(cfg.auth.oauth.github.clientSecret).to.equal('gshhhhhhhh')
    expect(cfg.auth.oauth.github.userAgent).to.equal('test-uagent-gh')
    expect(cfg.auth.oauth.github.callbackURL).to.equal('http://localhost:3333/auth/github/callback')
    expect(cfg.auth.oauth.github.scope.length).to.equal(1)
    expect(cfg.auth.oauth.github.scope[0]).to.equal('user')

    DONE()
  })


  IT('merge app.json values and sub-section on top of defaults', function() {
    let github = { short: 'gh', login: true, signup: false, emails: true, 
      logic: 'oauth', clientID: 'ghtest2', clientSecret: 'ghtest2-secret', 
      userAgent: 'ghtest2-ua', scope: ['user'],
      callbackURL: 'http://localhost:4444/auth/github/callback' }

    let appJson = { 
      auth: { appKey: 'test6', oauth: { github }, token: undefined, password: undefined }, 
      comm: undefined, 
      model: undefined, 
      middleware: undefined, 
      wrappers: { timezone: { key: 'testtime' } } 
    }
    
    process.env.AUTH_OAUTH_GITHUB_CLIENTID = 'ghtest6'
    process.env.AUTH_OAUTH_GITHUB_CLIENTSECRET = 'ghtest6-secret'
    process.env.AUTH_OAUTH_GITHUB_USERAGENT = 'ghtest6-ua'
    process.env.LOG_APPKEY = 'test8'
    process.env.LOG_VERBOSE = 'true'
    process.env.LOG_ERRORS_MAIL_TO = "email@mail.com"
    process.env.LOG_ERRORS_MAIL_SENDER = "from@mail.com"
    process.env.PORT = "4444"

    let cfg = Configure(appJson, 'dev', {dotEnv:false})
    expect(cfg.auth.oauth.github.short).to.equal('gh')
    expect(cfg.auth.oauth.github.login).to.equal(true)
    expect(cfg.auth.oauth.github.signup).to.equal(false)
    expect(cfg.auth.oauth.github.emails).to.equal(true)
    expect(cfg.auth.oauth.github.clientID).to.equal('ghtest6')
    expect(cfg.auth.oauth.github.clientSecret).to.equal('ghtest6-secret')
    expect(cfg.auth.oauth.github.userAgent).to.equal('ghtest6-ua')
    expect(cfg.auth.oauth.github.callbackURL).to.equal('http://localhost:4444/auth/github/callback')
    expect(cfg.auth.oauth.github.scope.length).to.equal(1)
    expect(cfg.auth.oauth.github.scope[0]).to.equal('user')
    expect(cfg.log.verbose).to.be.true
    // expect(cfg4.log.quiet).to.be.undefined
    expect(cfg.wrappers.timezone.key).to.equal('testtime')
    DONE()
  })


  IT('add nested appConfig sub-section where no defaults exist', function() {
    var appCfg8 = { log: { appKey: 'test8', test8: { theme: { run: 'white', error: 'red' } } }, auth: undefined, comm: undefined, model: undefined, middleware: undefined  }
    process.env.LOG_ERRORS = "{{undefine}}"
    process.env.LOG_QUIET = "true"
    let c = Configure(appCfg8, 'dev', {dotEnv:false})
    expect(c.log.test8.theme.run).to.equal('white')
    expect(c.log.test8.theme.error).to.equal('red')
    expect(c.log.verbose).to.be.undefined
    expect(c.log.quiet).to.be.true
    DONE()
  })


  IT('add nested appConfig false value where no defaults exist', function() {
    process.env.MIDDLEWARE_SESSION_STORE_COLLECTION = 'sessions-test0'
    process.env.LOG_APPKEY = "{{undefine}}"
    process.env.LOG_ERRORS = "{{undefine}}"
    var appCfg9 = { auth: { appKey: 'tt', password: undefined, token: undefined, oauth: { github: { unlink: false, relink: true, clientID: 'test', clientSecret: 'test', userAgent: 'tt9' } } }, comm: undefined, model: undefined }
    var cfg9 = Configure(appCfg9, 'dev', {dotEnv:false})
    expect(cfg9.auth.oauth.github.relink).to.equal(true)
    expect(cfg9.auth.oauth.github.unlink).to.equal(false)
    DONE()
  })


  IT('applies env var value on top of appConfig base and {{required}} values', function() {
    var appCfg11 = {
      log: { appKey: 'test11', it: { test11: { theme: { run: 'blue', error: 'magenta' } } } },
      wrappers: { timezone: { key: '{{required}}' }},
      auth: undefined, comm: undefined, model: undefined, middleware: undefined
    }
    process.env.LOG_ERRORS = '{{undefine}}'
    process.env.LOG_IT_TEST11_THEME_RUN = 'gray'
    process.env.LOG_IT_TEST11_THEME_ERROR = 'white'
    process.env.WRAPPERS_TIMEZONE_KEY = 'whitetime'
    var cfg11 = Configure(appCfg11, 'dev', {dotEnv:false})
    expect(cfg11.wrappers.timezone.key).to.equal('whitetime')
    expect(cfg11.log.it.test11.theme.run).to.equal('gray')
    expect(cfg11.log.it.test11.theme.error).to.equal('white')
    DONE()
  })


  SKIP('env vars without defaults or appConfig placeholders disappear', function() { })


  IT('Dev mode gets default host without http.host env input', function() {
    var appCfg12 = { auth: undefined, comm: undefined, model: undefined, middleware: undefined }
    process.env.LOG_APPKEY = "test12"
    process.env.LOG_ERRORS = '{{undefine}}'
    var cfg12 = Configure(appCfg12, 'dev', {dotEnv:false})
    expect(cfg12.http.host).to.equal('http://localhost:3333')
    DONE()
  })


  IT('PORT not appended to http.host != localhost', function() {
    process.env.HTTP_HOST = "https://prod.com"
    process.env.LOG_APPKEY = "test13"
    process.env.PORT = '1234'
    process.env.LOG_ERRORS = '{{undefine}}'
    let c = Configure({ auth: undefined, 
                        comm: undefined, 
                        model: undefined, 
                        middleware: undefined }, 
              'test', {dotEnv:false})
    expect(c.http.host).to.equal("https://prod.com")
    expect(c.http.port).to.equal(1234)
    expect(c.port).to.be.undefined
    DONE()
  })


  IT('Applies distribution bundle values when environment dist.manifest set', function() {
    process.env.MIDDLEWARE_SESSION_STORE_COLLECTION = 'sessions'
    process.env.LOG_APPKEY = "test14"
    process.env.LOG_ERRORS = '{{undefine}}'

    // var cfg14a = Configure(join(__dirname, '../data/fixtures/app14'), 'dev')

    // expect(cfg14a.http.static.bundles["js/ang1.js"]).to.equal("js/ang1.js")
    // expect(cfg14a.http.static.bundles["css/app.css"]).to.equal("css/app.css")

    process.env.HTTP_STATIC_MANIFEST = 'rev.json'
    var cfg14b = Configure(join(__dirname, '../../data/fixtures/app14'), 'dev')
    expect(cfg14b.http.static.bundles["js/ang1.js"]).to.equal("/js/ang1-14a26f2a4e.js")
    expect(cfg14b.http.static.bundles["css/app.css"]).to.equal("/css/app-0d80f1fb17.css")

    DONE()
  })

}

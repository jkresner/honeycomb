var {join}                   = require('path')
var Defaults                 = require('./config.defaults.js')
var getInstance              = require('./configure.merge')
var appDir                   = process.cwd()
var dirs = (cfg, path, defaults) => cfg && (cfg.dirs||defaults) ? Object.assign(cfg,
  { dirs: (cfg.dirs||defaults).split(',').map(d => join(appDir, path, d)) }) : []


/**                                                                  configure(
* Merges config specification sources (defaults, app, env, dotEnv)
* and augments computed values to produce an instance of config with
* for an app running in a specific environment
*
*  Object    @app defines the structure of an applications config independent
*              of the environment it is running in.
*  String    @env name of the environment, e.g. but not limited to
*              'dev', 'test', 'staging', 'production'
*  String    @dotEnv path to a .env file specifying environment value
*              overrides for config in @app
/                                                                           )*/
module.exports = function(cfgDir, env, dotEnv) {

  // hack to pass legacy tests
  let app = cfgDir.constructor == String ?
    require(join(cfgDir, 'app.json')) : Object.assign({},cfgDir)


  if (app.appDir) app.appDir = join(cfgDir, app.appDir)  

  env                          = env || 'dev'
  appDir                       = app.appDir || appDir

  //-- Load values from .env file into process.env vars
  if (dotEnv && env != 'production')
    require('dotenv').load({path:join(cfgDir, `app.${env}.env`)})

  //-- Output config values
  var $logIt = process.env.LOG_IT_CFG_INIT ? ((v1, v2) => 
    console.log(v1.toUpperCase().dim, `${v2}`)) : ()=>{}
  
  $logIt(`\n:Configure.${env.toUpperCase()}`, 'start')

  //-- Get fresh set of defaults
  var defaults                 = Defaults()
  if (env == 'dev')
    defaults.http.host         = `http://localhost:${process.env.HTTP_PORT||defaults.http.port}`

  //-- Stir up app, defaults and env for our cooked config instance
  var cfg                      = getInstance(env, $logIt).merge(app, defaults)

  dirs(cfg.routes, 'server', 'routes')
  dirs(cfg.middleware, 'server', 'mw')
  dirs(cfg.model, 'server', 'model')
  dirs(cfg.wrappers, 'server')
  dirs(cfg.logic, 'server', 'logic')

  var tmpls = (cfg.templates||{}).dirs || {}
  for (var type in tmpls) tmpls[type] = tmpls[type].split(',').map(dir=>join(appDir, dir))

  if (app.about) {
    var [src,pick] = app.about.split(':')
    var about = require(join(appDir, src))
    cfg['about'] = pick === undefined ? about : {}
    if (pick) for (var attr of pick.split(','))
      cfg.about[attr] = about[attr]
  }

  var {static} = cfg.http||{}
  if (static) {
    var {favicon,bundles,host} = static
    if (favicon) static.favicon.root = join(appDir, favicon.root)
    
    dirs(static, '/')
    //-- review
    static.dirs = static.dirs || []   
    
    var rev = static.manifest ? require(join(appDir, static.manifest)) : {}
    for (var bundle in rev) 
      cfg.http.static.bundles[bundle] = host.replace(/\/$/,'') + '/' + rev[bundle]
  }

  var {cookie} = (cfg.middleware||{}).session || {}
  if (cookie) cfg.middleware.session.cookie.maxAge = parseInt(cookie.maxAge)

  if (cfg.http && cfg.auth) {
    var oauth = cfg.auth.oauth || {}
    for (var provider in oauth)
      Object.assign(oauth[provider], {
        logic: oauth[provider].logic || 'oauth',
        callbackURL: oauth[provider].callbackURL||`${cfg.http.host}/auth/${provider}/callback`
      })
    
    var password = cfg.auth.password || {}
    for (var feature in password)
      Object.assign(password[feature], { logic: password[feature].logic || 'password' })  
  }

  if (process.env.LOG_IT_CFG_INIT) console.log(`app  CONFIG (${env})`)
  
  return cfg
}

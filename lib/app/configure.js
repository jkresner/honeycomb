const join                   = global.join || require('path').join
const colors                 = require('colors')
const Defaults               = require('./config.defaults.js')
const Merge                  = require('./configure.merge')
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
module.exports = function(cfgDir, env="dev", dotEnv) {

  // hack to pass legacy tests
  let app = cfgDir.constructor == String ?
    require(join(cfgDir, 'app.json')) : Object.assign({},cfgDir)


  if (app.appDir) app.appDir = join(cfgDir, app.appDir)
  appDir                     = app.appDir || appDir

  //-- Load values from .env file into process.env vars
  if (dotEnv && env != 'production')
    require('dotenv').config({path:join(cfgDir, `app.${env}.env`)})

  //-- Output config values
  var $logIt = !process.env.LOG_QUIET && process.env.LOG_IT_CFG_INIT ?
    ((v1, v2) => console.log(v1.toUpperCase(), `${v2}`)) : ()=>{}

  $logIt(`:Configure.${env.toUpperCase()}`, 'start')

  //-- Get fresh set of defaults
  let defaults                 = Defaults()

  if (app.auth) 
    app.auth = assign(require('../auth/config.defaults.js')(), app.auth)

  //-- Stir up app, defaults and env for our cooked config instance
  let cfg                      = Merge(env, $logIt).merge(app, defaults)

  dirs(cfg.routes, 'server', 'routes')
  dirs(cfg.middleware, 'server', 'mw')
  dirs(cfg.model, 'server', 'model')
  dirs(cfg.wrappers, 'server')
  dirs(cfg.logic, 'server', 'logic')

  var tmpls = (cfg.templates||{}).dirs || {}
  for (var typ in tmpls) 
    tmpls[typ] = tmpls[typ].split(',')
                           .map(dir=>join(appDir, dir))

  if (app.about) {
    var [src,pick] = app.about.split(':')
    var about = require(join(appDir, src))
    cfg['about'] = pick === undefined ? about : {}
    if (pick) for (var attr of pick.split(','))
      cfg.about[attr] = about[attr]
  }

  if (!cfg.http) return cfg

  cfg.http.port = parseInt(`${process.env.PORT||cfg.http.port||1111}`)

  if (cfg.http.host == 'localhost')
    cfg.http.host = `http://localhost:${cfg.http.port}`

  let {static} = cfg.http||{}
  if (static) {
    let {favicon,bundles,host} = static
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
    for (let feature in password)
      Object.assign(password[feature], { logic: password[feature].logic || 'password' })
  }
 
  return cfg
}

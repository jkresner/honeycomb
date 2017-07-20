const undefine = '{{undefine}}'
var $logConfig = null
var atLeaf     = val => typeof val !== 'object'
                        || val.constructor === Array
                        || val.constructor === RegExp

/**                                                              recusiveMerge(
* Recursively traverse and merge

*  String    @key to check for environment values to apply
*  Object    @defaults (meanair default base config : configure.defaults.js)
*  Object    @app (application specific sections / exclusions
*
*  @return   tree (or leaf) of instance of config combining defaults,
*            app and environment vars
/                                                                           )*/
function mergeRecursive(key, defaults, app) {
  
  key = key ? key.toUpperCase() : null
  
  if (app === undefined || app == undefine || process.env[key] == undefine)
    return undefine

  var config = defaults

  var atOverrideVal = app === null ? false : atLeaf(app)
  var atDefaultVal = defaults === null || atLeaf(defaults)
  if (atOverrideVal || atDefaultVal) {
    if (process.env[key] !== undefined) {
      var v = process.env[key]
      config = v === 'true' || v === 'false' ? v === 'true' : v
    }
    else if (app !== null)
      config = app

    if (config == '{{required}}')
      throw Error(`Configure failed. Override or environment var required for config.${key}`)

    if (config === false || config && atLeaf(config)) {
      if (config != undefine) $logConfig(key, config)
      return config
    }
  }

  for (var attr in defaults) {
    var childKey = key ? `${key}_${attr}` : attr
    var childOverrides = app && app.hasOwnProperty(attr) ? app[attr] : null
    config[attr] = mergeRecursive(childKey, defaults[attr], childOverrides)
    if (config[attr] == undefine)
      delete config[attr]
  }

  for (var attr in app) {
    if (!(defaults||{}).hasOwnProperty(attr)) {   // && app[attr]
      var childKey = key ? `${key}_${attr}` : attr
      config[attr] = mergeRecursive(childKey, null, app[attr])
      if (config[attr] == undefine)
        delete config[attr]
    }
  }

  return config

}



module.exports = (env, $logIt) => ({

  merge(app, defaults) {
    var rootKey = null
    app.env     = env
    app.appDir  = app.appDir || process.cwd()
    $logConfig  = $logIt
    
    var cfg = mergeRecursive(rootKey, defaults, app)

    // for (var pattern in (cfg.log && cfg.log.prettify ? cfg.log.prettify : {}))
    // cfg.log.prettify[pattern] = new RegExp(cfg.log.prettify[pattern], 'i')
    if (cfg.log && cfg.log.error && cfg.log.error.mute)
      cfg.log.error.mute = new RegExp(cfg.log.error.mute, 'i')

    var udPatterns = ((cfg.middleware||{}).ctx||{}).ud || {}
    for (var pattern in udPatterns)
      if (typeof udPatterns[pattern] === 'string')
        cfg.middleware.ctx.ud[pattern] = new RegExp(udPatterns[pattern])

    return cfg
  }

})


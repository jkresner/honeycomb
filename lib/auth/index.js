module.exports = {

  mergeConfig(config) {
    var cfg = config.auth

    honey.libs.passport = require('passport')
    if (cfg.password) 
      assign(honey.libs, {bcrypt:require('bcrypt')})
 
    return {
      name:           'honey.auth',
      dir:            __dirname,
      logic:          true,
      model:          { opts: { excludes: cfg.orgs ? [] : ['org'] } },
      middleware:     true,
      routes:         true,
      wrappers:       cfg.wrappers != null ? cfg.wrappers : true
    }
  }

}

module.exports = {

  mergeConfig(config) {
    let cfg = config.auth
    if (!cfg) return

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
      wrappers:       cfg.wrappers || false
    }
  }

}

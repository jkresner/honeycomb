'use strict';


class Middleware {
  constructor(Util) {

    var Config = honey.cfg('middleware')
    var DAL = honey.model.DAL
    var Logic = honey.logic
    let $mw = require('./../log/middleware')()
    var $req = Util.Request

    this.lazyLoad = (groupName) => {
      if (!this[`_${groupName}`]) {
        let group = honey.fs.require(__dirname, groupName,
          [{Config,DAL,Logic,$mw,$req},honey.libs])

        for (var mwName in group)
          group[mwName] = $mw.wrap(groupName, mwName, group[mwName])

        group.extend = (mwName, fn) => // ? , opts) =>
          group[mwName] = $mw.wrap(groupName, mwName, fn)

        this[`_${groupName}`] = group
        TIME(`MW_${groupName.toUpperCase()}`)
      }
      return this[`_${groupName}`]
    }

    //-- We want to reuse instances of middleware as much as possible
    this['_cached'] = {}

    // if (cfg.api)
    this.cache('apiJson', this.res.api({logIt:config.log.it.mw.api}))
  }

  $$(list) {
    return list.split(' ').map(key => this['_cached'][key])
  }

  cache(key, middlewareFn) {
    this['_cached'][key] = middlewareFn
    return middlewareFn
    //returning this would allow nice chaining syntax
  }

  get Cached() { return this['_cached'] }
  get $() { return this['_cached'] }

  get analytics() { return this.lazyLoad('analytics') }
  get api() { return this.lazyLoad('api') }
  get data() { return this.lazyLoad('data') }
  get req() { return this.lazyLoad('req') }
  get res() { return this.lazyLoad('res') }
  get session() { return this.lazyLoad('session') }
  get auth() { return this.lazyLoad('auth') }
}


module.exports = function(Util) { return new Middleware(Util) }

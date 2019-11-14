'use strict';

class Middleware {
  constructor(Util) {
    let {DAL} = honey.model
    let $mw = honey.log.mw
    var $req = Util.Request

    this.lazyLoad = (groupName) => {
      if (!this[`_${groupName}`]) {
        let group = honey.fs.require(__dirname, groupName,
          [{DAL,$mw,$req},honey.libs])

        for (var mwName in group)
          group[mwName] = $mw.wrap(groupName, mwName, group[mwName])

        group.extend = (mwName, fn) => // ? , opts) =>
          group[mwName] = $mw.wrap(groupName, mwName, fn)

        this[`_${groupName}`] = group
        TIME(`MW_${groupName.toUpperCase()}`)
      }
      return this[`_${groupName}`]
    }

    this.cacheSet = (set, src, cfg) => {
      for (let name in set) 
        this.cache(name, set[name])
    }
  }

  cache(key, middlewareFn) {
    this['_cached'][key] = middlewareFn
    return middlewareFn
    //return this; would allow nice chaining syntax
  }

  init(app) {
    //-- Reuse middleware instances as much as possible
    this['_cached'] = {}
    let cfg = honey.cfg('middleware')
    let opts = { strict:false, dependencies: [app, this, cfg], skip: [] }
    // optional to define config per mw
    for (let mw in cfg) cfg[mw] === null || cfg[mw].off === true ? opts.skip.push(mw) : 0

    for (let dir of cfg.dirs) {
      let y = [], n = []
      let set = honey.fs.requireDir(dir, opts)
      for (let name in set) opts.skip.indexOf(name) < 0 ? y.push(name) :n.push(name) 
      this.cacheSet(set, dir, cfg)
      LOG('cfg.mw', `mw.$[${y.length}]`, 
        `$${y.join(' $')}, skipp: ${n.join('-').dim.magenta} ${dir.gray}`)
    }


    let required = {}, defaults = {
      error: () => this.res.error(),
      // livereload: () => require('connect-livereload')(cfg.livereload),
      notfound: () => this.res.notfound({name:'404'}),
      wrap: () => this.req.wrap(cfg.wrap) }

    Object.keys(defaults)
      .filter(name => !this['_cached'][name])
      .forEach(name => required[name] = defaults[name]())

    if (Object.keys(required).length > 0)
      this.cacheSet(required, '[defaults]', cfg)

    TIME(`MIDDLEWARE Cached`, Object.keys(this['_cached']))
    return this
  }

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

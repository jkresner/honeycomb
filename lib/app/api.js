'use strict';

module.exports = function(app, mw) {

  let cfg = honey.cfg('middleware.api')

  var endpoints = function(router, namespace, method, api) {
    return (opts, cfg) => {
      if (!cfg) {
        cfg = opts
        opts = {}
      }

      let {projector} = honey
      let logic = honey.logic[namespace]
      for (var op in cfg) {
        let params = []
        let url = '/'+op

        var argsMap = cfg[op]
          .split(' ')
          .filter(elm=>elm!='')
          .map(map => {
            if (map.indexOf('params.') == 0 || api.params.indexOf(map) != -1) {
              let name = map.replace('params.','').split(':')[0]
              url += `/:${name}`
              if (api.params.indexOf(map) != -1) {
                let pOpts = { required:true, mwName:`param:${name}`,
                  project: _.get(projector,`${name}s.Project.param`) ,
                  queryOpts: _.get(projector,`${name}s.Opts.param`) }
                params.push(mw.data.recast(name, `params.${name}`, pOpts))
              }
            }
            return map
          })

        url = url.toLowerCase()
                 .replace(/get|list|update|create|delete/i,'')
                 .replace(`/${api.resource}`,'/')
                 .replace(`${api.resource}/`,'/')
                 .replace('//','/')
                 .replace(/^\/$/,'')

        var args = [url].concat(params)

        var endpointMiddleware = opts.use ? opts.use.split(' ') : []
        for (let name of endpointMiddleware)
          args.push(mw.$[name])

        if (!logic[op])
          throw Error(`api:${method} logic [${namespace}.${op}] undefined`)

        if (!logic[op].validate && method != 'get')
          throw Error(`api:${method} ${namespace}.${op}.validate undefined`)

        args.push(mw.data.api(namespace, op, argsMap))

        router[method].apply(router, args)
      }
      return this
    }
  }


  return function(logic, opts={}) {
    var _api = {}

    assign(opts, {
      type:'api',
      params:[],
      mount: opts.baseUrl || `${cfg.baseUrl}/${logic}`,
      resource: logic.replace(/s$/i,'')
      // resource: opts.rest ? logic.replace(/s$/i,'') : undefined
    })

    var router = honey.Router(`api:${logic}`, opts)
      .use(mw.$.session)
      .use(mw.$.apiJson, {end:true})

    for (var method of ['get','post','put','delete'])
      _api[method] = endpoints.call(_api, router, logic, method, opts)

    return assign(_api, {
      params(names) {
        for (var name of names.split(' '))
          opts.params.push(name)

        return this
      },
      uses(names) {
        names.split(' ')
             .forEach(name => {
               if (!mw.Cached[name])
                 throw Error(`mw.API fail. mw.${name} must be cached`)
              router.use(mw.$[name]) })
        return this
      }
    })
  }

}

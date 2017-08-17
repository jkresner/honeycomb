'use strict';

module.exports = function(app, mw) {

  let cfg = honey.cfg('middleware.api')

  var endpoints = function(router, namespace, method, api) {
    return (opts, cfg) => {
      if (!cfg) {
        cfg = opts
        opts = {}
      }

      let logic = honey.logic[namespace]
      for (var op in cfg) {
        let url = '/'+op

        var argsMap = cfg[op]
          .split(' ')
          .filter(elm=>elm!='')
          .map(map => {
            if (map.indexOf('params.') == 0 || api.params.indexOf(map) != -1)
              url += `/:${map.replace('params.','').split(':')[0]}`
            return map
          })

        url = url.toLowerCase()
                 .replace(/get|list|update|create|delete/i,'')
                 .replace(`/${api.resource}`,'/')
                 .replace(`${api.resource}/`,'/')
                 .replace('//','/')
                 .replace(/^\/$/,'')

        var args = [url]

        var endpointMiddleware = opts.use ? opts.use.split(' ') : []
        for (var name of endpointMiddleware)
          args.push(mw.$[name])

        if (!logic[op])
          throw Error(`api:${namespace}.${op} logic undefined`)

        if (!logic[op].validate && method != 'get')
          throw Error(`api:${method} ${namespace}.${op}.validate undefined`)

        args.push(mw.data.api(namespace, op, argsMap))

        // console.log('API.op', args)
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
        for (var paramKey of names.split(' ')) {
          var [name,queryKey] = paramKey.split(':')
          var queryOpts = _.get(honey,`projector.${name}s.Opts.param`)
          router.param(name, mw.data.param(name, { queryKey, queryOpts }))
          opts.params.push(name)
        }
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

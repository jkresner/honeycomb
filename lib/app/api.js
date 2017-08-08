'use strict';

module.exports = function(app, mw) {

  var $req = require('./../util/req')
  var reqContextAttrs = ['ip','ref','sId','ua','user']
  var reqContext = {}
  reqContextAttrs.forEach(attr => reqContext[attr] = true)
  

  var endpoints = function(router, logic, method, params) {

    var resource = logic.replace(/s$/,'') // rest friendly urls

    return (opts, cfg) => {
      if (!cfg) {
        cfg = opts
        opts = {}
      }

      // console.log('opts.resource', logic, opts, opts.rest, opts.resource)
      // console.log(`API.${logic}.${method.toUpperCase()}.cfg|opts`.white, cfg, opts, honey.logic)
      for (var fnName in cfg) {
        var url = ('/'+fnName)
          .toLowerCase()
          .replace(/get|list|update|create|delete/i,'')
          .replace(`/${resource}`,'/')
          .replace(`${resource}/`,'/')
          .replace(/^\/$/,'')


        var argsMap = cfg[fnName].split(' ')
                                 .filter(elm=>elm!='')
                                 .map(    
          map => {
            if (map.indexOf('params.') == 0 || 
                params.indexOf(map) != -1)
              
              url += `/:${map.replace('params.','').split(':')[0]}`

            return map
          })

        var args = [url]

        // console.log(`API.${logic}.${method.toUpperCase()}.logic.${fnName}`.white, honey.logic[logic][fnName])
        // console.log(`API.${logic}.${method.toUpperCase()}.argsMap`.white, argsMap)

        var endpointMiddleware = opts.use ? opts.use.split(' ') : []
        // console.log('cfg.middleware', endpointMiddleware)
        for (var name of endpointMiddleware)
          args.push(mw.$[name])

        if (!honey.logic[logic][fnName])
          throw Error(`api:${logic.gray}.${fnName} logic not defined`)

        var {validate} = honey.logic[logic][fnName]
        if (!validate && method != 'get')
          throw Error(`api:${method} endpoints require a validation function`)
        else if (validate)
          args.push(mw.data.valid(`${logic}.${fnName}`, argsMap, validate))

        //-- review using supposed deprecated mw.data.logic
        args.push(mw.data.logic(logic, fnName, argsMap))

        router[method].apply(router, args)
      }
      return this
    }

  }


  return function(logic, opts) {
    var _api = {}

    opts = assign(opts||{}, {type:'api'})
    opts.params = []
    opts.mount = opts.baseUrl || `${config.middleware.api.baseUrl}/${logic}`
    if (opts.rest) opts.resource = logic.replace(/s$/i,'')

    var router = honey.Router(`${logic}:api`, opts)
      .use(mw.$.session)
      .use((req,res,next) => {
        req.ctx = {prefix:'api'}
        for (var key of reqContextAttrs)
          $req.ctx.set(req, reqContext, key)
        next()  
      })
      .use(mw.$.apiJson, {end:true})

    //-- deprecating soon
    for (var method of ['get','post','put','delete'])
      _api[method] = endpoints.call(_api, router, logic, method, opts.params)

    return assign(_api, {
      params(cfg) {
        if (cfg.constructor === String) cfg = cfg.split(' ')
        for (var paramKey of cfg) {
          var [paramName,queryKey] = paramKey.split(':')                    
          router.param(paramName, mw.data.param(paramName,
            { queryKey, queryOpts: honey.projector[`${paramName}s`].Opts.item } ))          
          opts.params.push(paramName)
        }
        return this
      },
      uses(names) {
        if (names.constructor === String) names = names.split(' ')
        for (var name of names) {
          if (!mw.Cached[name]) throw Error(`API.init fail. mw.${name} must be cached`)
          else router.use(mw.$[name])
        }
        return this
      }
    })
  }

}

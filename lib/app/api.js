'use strict';

module.exports = function(app, mw, cfg) {

  var endpoints = function(router, namespace, method, api) {
    /* app.API(...)
    *     .get({ use: 'mw1 mw2' },  // opts: {}   * optional
    *          { op1: 'body',       // ops:  2 x  {name: argsMap}
    *            op2: 'query'   })
    /     .get({ op3: '' })         // ops:  1 x  {name: !argsMap}    */
    return (opts, ops) => {
      if (!ops) {
        ops = opts
        opts = {}
      }

      let {projector} = honey
      let logic = honey.logic[namespace]
      for (let op in ops) {
        let params = []
        let url = '/'+op

        var argsMap = ops[op]
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

  let it = honey.cfg('log.it.mw.content') ||
          (honey.cfg('log.verbose') ? 'yellow' : false)

  let formatter = ({body,params,query}, r) => `
${'  INP'[it]}${honey.log.json({body,params,query})}
${'  OUT'[it]}${r ? honey.log.json(r) : 'empty'.dim}`

  let json = assign({ name:'api/json' }, it?{formatter}:{})

  return function(logic, opts={}) {
    var _api = {}

    assign(opts, {
      content: opts.content || json,
      type: 'api',
      params: [],
      mount: opts.baseUrl || `${cfg.baseUrl}/${logic}`,
      resource: logic.replace(/s$/i,'')
    })

    var router = honey.Router(`api:${logic}`, opts)
      // .use(mw.$.parse)
      .use(mw.$.session)
      .use(mw.res.content(opts.content), {end:true})

    for (var method of ['get','post','put','delete'])
      _api[method] = endpoints.call(_api, router, logic, method, opts)

    return assign(_api, {
      params(names) {
        opts.params = opts.params.concat(names.split(' '))
        return this
      },
      uses(names) {
        names.split(' ')
             .forEach(name => {
                if (!mw.$[name]) throw Error(`API.uses fail: mw.$.${name} undefined`)
                router.use(mw.$[name]) })
        return this
      }
    })
  }

}

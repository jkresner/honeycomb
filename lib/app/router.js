module.exports = function(app, express) {
  var cfg = honey.cfg('http')

  app.routers = {}
  if (((cfg||{}).static||{}).sitemap) app.sitemap = []


  return function(name, opts={}) {
    if (!name) throw Error(`app.router[{name}] required`)
    if (app.routers[name]) throw Error(`app.routers.${name} already exists`)

    var type = opts.type || 'html'
    var mountUrl = opts.mount || '/'
    var chain = { start:[],end:[] }  //params: [],

    var sitemapIt = type == 'html' && app.sitemap && opts.sitemap !== false
    var log = assign({ get:'GET',post:'POS',delete:'DEL',put:'PUT' },
                     { type:type+`      `.slice(0,6-type.length) })
    if (mountUrl!='/') log.mount = mountUrl

    var _r = new express()
    _r.set('x-powered-by', false)
    if (!opts.type || /(html|auth)/.test(opts.type))
      app.setViewOpts(_r)

    function wrapped(args, method) {
      let mthd = method.substring(0,3).toUpperCase()
      args.splice(1,0,app.honey.middleware.$.wrap)
      if (honey.cfg('log.verbose'))
        args.splice(1,0, (req, res, next) => next(
          $log(`[${mthd}${req.originalUrl}]`.blue.dim+`route[${name}].${method}(${args[0]})`.blue)))

      return  args
    }

    var routeIt = method => function() {
      var args = [].slice.call(arguments)
      var startIdx = 0

      for (var m of chain.start) args.splice(++startIdx,0,m)
      for (var m of chain.end) args.push(m)

      //-- used for auth testing ...
      if (mountUrl != '/' && args[0].constructor == String && args[0].indexOf(mountUrl) == 0)
        args[0] = args[0].replace(mountUrl,'')

      _r[method].apply(_r, wrapped(args, method))

      var urls = args[0].constructor == Array ? args[0] : [args[0]]
      if (sitemapIt && /get/.test(method)) {
        var mount = mountUrl == '/' ? cfg.host : cfg.host+mountUrl
        for (var url of urls) app.sitemap.push(mount+url)
      }

      LOG('cfg.route', `${log[method]} ${log.mount||''}`, `${urls.join('\n\t\t\t       ')}`)
      // console.log(`route.${name}`, args, chain.params.length)
      return app.routers[name]
    }

    var honeyRoutes = {
      use(middleware, at) {
        if (middleware) {
          if (at) chain.end = chain.end.concat(middleware)
          else chain.start = chain.start.concat(middleware)
        }
        // console.log(`use.at:${name}[${at?'end':'start'}]`.green, chain[at?'end':'start'].length, !!middleware)
        return this
      },
      // useEnd(middleware) {
      //   chain.end = chain.end.concat(middleware)
      //   return this
      // },
      param(name) {
        // _r.param.apply(_r, arguments)
        let {recast} = app.honey.middleware.data
        let src = `params.${name}`
        let mwName = `param:${name}`
        chain.start.push(recast(name, src, {mwName,require:true}))
        return this
      },
      files() {
        var args = [].slice.call(arguments)
        var {dir} = args.pop()

        args.push((req, res, next) =>
          res.set('Content-Type', /\.xml$/.test(req.url)?'application/xml':'text/plain')
             .sendFile(`${dir}${req.url}`))

        var files = args.shift()
        for (var file of files)
          routeIt('get').apply(_r, [`/${file}`].concat(args))

        return this
      },
      static() {
        var args = [].slice.call(arguments)
        var opts = args.pop()

        // if (!(args[0]&&(args[0] instanceof String))
          // throw Error(`router.static requires url as first param: ${args[0] instanceof String}`)
        if (!(opts||{}).dir)
          throw Error(`router.static requires opts.dir as last param`)

        var startIdx = 0
        for (var m of chain.start) args.splice(++startIdx,0,m)

        args.push(express.static(opts.dir, opts))

        _r.use.apply(_r, wrapped(args, 'static'))
        LOG('cfg.route', `dir   GET${mountUrl.replace('/','')}`, `:: ${args[0]}/*.*   ${opts.dir.gray}`)
        return this
      },
      all: routeIt('all'),
      get: routeIt('get'),
      put: routeIt('put'),
      post: routeIt('post'),
      delete: routeIt('delete'),
      head: routeIt('head'),
    }


    app.routers[name] = assign({}, _r, honeyRoutes)
    app.routers[name].mount = () => app.use(mountUrl, _r)

    return app.routers[name]
  }

}

module.exports = function(app, express) {
  app.routers = {}

  if (honey.cfg('http.static.sitemap'))
    app.sitemap = []

  return function(name, opts={}) {
    if (!name) throw Error(`app.router[{name}] required`)
    if (app.routers[name]) throw Error(`app.routers.${name} already exists`)

    let sitemap = app.sitemap && (opts.sitemap!==false)
    var type = opts.type || 'html'
    var mountUrl = opts.mount || '/'
    var chain = { start:[],end:[] }  //params: [],
    var log = assign({ get:'GET',post:'POS',delete:'DEL',put:'PUT', all:'ALL', head: 'HED' },
                     { type:type+`      `.slice(0,6-type.length) })
    if (mountUrl!='/') log.mount = mountUrl

    var _r = new express()
    _r.set('x-powered-by', false)
    if (!opts.type || /(html|auth)/.test(opts.type))
      app.setViewOpts(_r)

    function wrapped(args, method) {
      let mthd = method.substring(0,3).toUpperCase()
      args.splice(1, 0, app.honey.middleware.$.wrap)

      if (honey.cfg('log.verbose') || honey.cfg('log.it.mw.trace'))
        args.splice(1, 0, (req, res, next) => {
          let matches = `${args[0]}`
          if (args[0] instanceof Array) matches = args[0]
            .map(expr => expr.test ? expr:new RegExp(expr.replace(/\*/g,''),'i'))
            .filter(expr => expr.test(req.originalUrl))
            .map(match => `${match}`)
            .join('|')

          let colr = honey.cfg('log.it.mw.trace') || 'blue'
          next( $log(`[${mthd}${req.url}]`.dim +
          // next( $log(`[${mthd}${req.originalUrl}]`.dim +
                     `router[${name}].${method}(${matches})`[colr])
          )
        })

      return args
    }

    var routeIt = method => function() {
      var args = [].slice.call(arguments)
      var startIdx = 0

      for (var m of chain.start) args.splice(++startIdx,0,m)
      for (var m of chain.end) args.push(m)

      let sanitize = pattern => {
        // We can ignore regExp and non string
        if (pattern.test || !pattern.replace) return pattern
        //-- used for auth testing ...
        if (mountUrl != '/' && pattern.indexOf(mountUrl) == 0)
          pattern = pattern.replace(mountUrl,'')
        if (pattern.indexOf('++') > -1)
          // pattern = new RegExp(pattern.replace('++','\\+\\+'))
          pattern = pattern.replace('++','\\+\\+')
        return pattern
      }

      if (args[0] instanceof Array) args[0] = args[0].map(sanitize)
      else args[0] = sanitize(args[0])

      _r[method].apply(_r, wrapped(args, method))

      let urls = args[0].constructor == Array ? args[0] : [args[0]]
      let mount = mountUrl=='/'?'':mountUrl
      if (sitemap && method == 'get' && type == 'html')
        urls.forEach(url => app.sitemap.push(mount+url))

      LOG('cfg.route', `${log[method]} ${log.mount||''}`, `${urls.sort().join('   ')}`)
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
      param(name) {
        // _r.param.apply(_r, arguments)
        let {recast} = app.honey.middleware.data
        let src = `params.${name}`
        let mwName = `param:${name}`
        chain.start.push(recast(name, src, {mwName,require:true}))
        return this
      },
      file() {
        // let args = [].slice.call(arguments)
        // let {dir} = args.pop()
      //   // let ctype = 'text/plain'
      //   // if (/\.xml$/.test(req.url)) ctype = 'application/xml'
      //   // if (/\.(jpeg|jpg)$/.test(req.url)) ctype = 'image/jpeg')
      //   // if (/\.(png)$/.test(req.url)) ctype = 'image/png')
      //   // if (/\.(pdf|tiff)$/.test(req.url)) ctype = 'application/pdf')

        // args.push((req, res, next) =>
          // res.set('Content-Type', ctype)
          // .sendFile(`${dir}${req.url}`))

      //   var files = args.shift()
      //   for (var file of files)
        // routeIt('get').apply(_r, [`/${file}`].concat(args))

        // return this
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

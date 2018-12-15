function chain_static(app) {
  let cfg = honey.cfg('http.static') || {}
  let js = {}, css = {}
  for (let bundle in cfg.bundles) {
    let href = cfg.bundles[bundle]
    let key = bundle.split('.')[0] // remove extension
    if (key.match(/^(js\/)/)) js[key.replace('js/','')] = href
    if (key.match(/^(css\/)/)) css[key.replace('css/','')] = href
  }

  assign(app.locals, { static: {js,css,host:cfg.host}})

  if (cfg.favicon)
    app.use('/favicon.ico', (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = req.method === 'OPTIONS' ? 200 : 405
        res.setHeader('Allow', 'GET, HEAD, OPTIONS')
        res.setHeader('Content-Length', '0')
        res.end()
      } else {
        res.setHeader('Content-Type', 'image/x-icon')
        res.sendFile('favicon.ico', cfg.favicon)
      }})

  for (let dir of cfg.dirs)
    app.use(require('express').static(dir, cfg.opts)) &&
    LOG('cfg.route', `DIR /.`, `${dir}/*   ${JSON.stringify(cfg.opts).dim}`)
}


function chain_routes(app, mw) {
  let cfg     = honey.cfg('routes')||{}

  if (cfg.api)
    app.API   = require('./api')(app, mw, cfg.api)

  if (cfg.dirs) {
    for (let dir of cfg.dirs)
      honey.fs.requireDir(dir, { dependencies:[app, mw, cfg] })
    for (let router in app.routers)
      app.routers[router].mount()

    TIME(`ROUTES      Chained`)
  }
}


function sitemap(app) {
  let cfg = honey.cfg('http.static.sitemap')
  console.log('sitemap', cfg)
  LOG('cfg.sitemap', (app.sitemap||[]).length, cfg.file)
  require('fs').writeFileSync(cfg.file,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${app.sitemap.map(url => `<url><loc>${cfg.host}${url}</loc></url>`).join('\n  ')
      .replace(new RegExp(config.http.host,'g'), 'https://www.airpair.com')}
</urlset>`)
}


module.exports = function(app, done) {

  let cfg = honey.cfg('http')
  let ctx = Object.keys(cfg.ctx||{ref:true}).filter(n=>cfg.ctx[n])
  let mw  = require('./../middleware/index')(honey.util).init(app)
  app.honey.middleware = mw

  chain_static(app, mw)

  let parser = require('body-parser')
  app.use([
    parser.json({}),
    parser.urlencoded({extended:true}),
    function(req, res, next) {
      req.locals = req.locals || {}
      req.ctx = { start: new Date } // ['ip','ref','sId','ua','ud','utm','user']
      ctx.forEach(key => honey.util.Request.ctx.set(req, cfg.ctx, key))
      next()
    }])

  chain_routes(app, mw)

  if ((cfg.static||{}).sitemap) sitemap(app)

  let cb = done || (e => {})
  let ready = x => {
    // if (config.middleware.livereload)
      // require('fs').writeFile(join(config.appDir,'reload.log'),
        // moment().format()+'\n', {flag:'a'}, e => e)

    cb(null, TIME(`LISTENING   on:${cfg.port}`))
  }

  app.honey.run = () =>
    app.use(mw.$.wrap)
       .use(mw.$.session||((rq,rs,n)=>n()))
       .use(mw.$.notfound)
       .use(mw.$.error)
       .listen(cfg.port, ready)
       .on('error', cb)

  return app.honey

}

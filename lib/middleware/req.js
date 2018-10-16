module.exports = ({$mw,$req}) => ({

  /**                                                                     wrap(
  * First mw in honey middleware chain wrapping all others in
  * a domain for safer error handling and opts custom behavior at the
  * beginning and end of the chain
  *
  * Object     @opts[optional]
  *   Function  .onEnd non-blocking hook on the request end
  *   Function  .onSlow custom behavior, if undefined will just console.log
  *   Function  .onStart non-blocking hook before honey middleware chain
  *   Number    .slow number in milliseconds defining a slow request
  /                                                                         )*/
  wrap(opts={}) {
    let domain      = require('domain')
    let slow        = opts.slow || 1999
    let {verbose}   = honey.cfg('log')
    this.noWrap     = verbose === undefined

    return function(req, res, next) {
      function step(label, fn) {
        // console.log(`wrap.${label}`.yellow)
        if (fn) return fn(req,res,next)
      }

      // ? prefix does what... but breaks atm if removed
      req.ctx.prefix = $mw.name('req','wrap',req)._name.replace('wrap','').reset
      // $mw.trace()  // Output  [MTHD/*/trace] if MW_TRACE or MW_WRAP
      if (opts.onStart) {
        if (step('onStart', opts.onStart))
          return step('onStart.stop', opts.onEnd)
      }

      let reqd      = domain.create()
      domain.active = reqd
      reqd.add(req)
      reqd.add(res)

      if (opts.onEnd)
        res.once('finish', r => {
          req.ctx.duration = new Date - start
          if (req.ctx.duration > slow) {
            if (opts.onSlow) step('finish.onSlow', opts.onSlow)
            else console.log(`[${req.originalUrl}]wrap.slow`.cyan, `${duration}`.red)
          }

          step('finish.onEnd', opts.onEnd)
        })

      reqd.on('error', e => {
        step('error.next')
        $mw.done(e)
        return next(e)
      })

      step('run.next')
      reqd.run(next)
    }
  },


  // parse(opts={}) {
  //   // this.noWrap = opts.noWrap || true
  //   let parser = require('body-parser')
  //   let json = opts.json ? parser.json(opts.json) : null
  //   let url = opts.url ? parser.urlencoded(opts.url) : null
  //   if (!json&&!url) throw Error('mw.req.parse opts parser required')
  //   return function(req, res, done) {
  //     console.log('parse'.yellow)
  //     let next = done
  //     let start = json
  //     if (json && url) next = e => e ? done(e) : url(req, res, done)
  //     else if (url) start = url

  //     console.log('start'.yellow, start)
  //     console.log('next'.yellow, next)
  //     start(req,res,next)
  //   }
  // },

  /**                                                                  forward(
  * Forward pattern matched urls according mapped values
  *
  * Object     @opts[optional]
  *   Map       .map set of regexp match and replace with values
  *   String    .methods pipe separated string of http methods to observe
  *               e.g. "get|put|post"
  *   String    .src any string value prop on req e.g. req.path,
  *               defaults to req['originalUrl']
  *   Number    .status 302 (Temporary) or 301 (Permanent)
  *                                                                         )*/
  forward(opts) {
    opts = opts || {}
    this.mwName = opts.name ? `forward:${opts.name}` : 'forward'
    var status = opts.status || 301
    var src = opts.src || 'originalUrl' // or 'path'
    var methods = new RegExp(`(${opts.methods||'head|get'})`,'i')
    var map = opts.map || new Map()
    if (map.size == 0) map.set(/\.\.\./,'')  //-- Friendly default

    return function(req, res, done) {
      if (req.method.match(methods) && req.originalUrl != '/') {
        var input = req[src]
        for (var pattern of map.keys())
          var match = input.match(pattern)
          if (match) {
            var matched = match[0]
            // $log(req.originalUrl, 'matched'.green, pattern, match)
            var url = input.replace(matched, map.get(pattern))
            // var url = req.originalUrl.replace(matching, rewritten)
            if (status == 302) res.redirect(url)
            else res.redirect(301, url)
            var logData = `${status} => ${url} : matched ${pattern} ${input.replace(matched,matched.white)}`.gray
            // console.log(logData)
            return done(null, logData, $req.STOP)
          }
      }
      done()
    }
  }


})

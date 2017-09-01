var domain = require('domain')

module.exports = ({$mw,$req}) => ({


  /**                                                                     wrap(
  * Compulsory first middleware in honey middleware chain wrapping others in
  * a domain for safer error catching and optional custom behavior at the
  * beginning and end of the chain
  *
  * Object     @opts[optional]
  *   Function  .onStart non-blocking hook before honey middleware chain
  *   Function  .onEnd non-blocking hook on the request end
  *   Object    .context[optional]
  *     Boolean   .ip flag to include ip
  *     Boolean   .ref flag to include referer
  *     Boolean   .sId flag to include req.sessionID
  *     Boolean   .user flag to include user _id and name
  *     Boolean   .ua flag to include raw user-agent
  *     Object    .ud custom regExp to classify user-device
  *     Boolean   .utm flag to include utm values from query string
  *       //-- TO add
  *     Boolean   .firstReq flag to note if this is the first ever request
  *     Object    .browser | .devide | .os | .screen
  /                                                                         )*/
  wrap(opts) {
    this.noWrap = true
    opts = opts || {}
    var onStart = opts.onStart
    var onEnd = opts.onEnd
    var context = opts.context

    return function(req, res, next) {
      req.locals = req.locals || {}
      var prefix = $mw.name('req','wrap',req)._name.replace('wrap','')
      if (context) {
        req.ctx = {prefix}
        for (var key of ['ip','ref','sId','ua','ud','utm','user'])
          $req.ctx.set(req, context, key)
      }

      if (onStart) onStart(req)
      $mw.trace()
      res.once('finish', () => {
        if (onEnd) onEnd(req, res)
        //-- can't seem to dispose the domain. Write test after node v5 migrate
        //-- also domains seem to be deprecated in upcoming node versions
        // reqd.dispose()
      })
      var reqd = domain.create()
      domain.active = reqd
      reqd.add(req)
      reqd.add(res)
      reqd.on('error', (err) => {
        // console.log('mw.error'.magenta, err, req.next)
        $mw.done(err)
        return req.next(err)
      })
      reqd.run(next)
    }
  },


  /**                                                                     slow(
  * Hook logging or custom behavior onto slow requests
  *
  * Number     number of milliseconds and above considered slow for your app
  * Object     @opts[optional]
  *  Function   .onSlow custom behavior, if undefined will just console.log
  /                                                                         )*/
  slow(milliseconds, opts) {
    opts = opts || {}
    var onSlow = opts.onSlow
    return function(req, res, done) {
      var start = new Date()
      res.on('finish', function() {
        var duration = new Date() - start
        if (duration > milliseconds)
          onSlow ? onSlow(req, duration) : console.log(`[${req.originalUrl}]res.slow`.cyan, `${duration}`.red)
      })
      done()
    }
  },


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

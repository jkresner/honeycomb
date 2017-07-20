/**                                                                  analytics{
* Functions for tracking:
*
* 1. ads                          via impression() & view(type=='ad')
* 2. application behavior         via event()
* 3. access to domain objects     via view()
*
* * Requires wrap:opts.context.bot confgured, assess if the request is by bot
*                                                                           }*/
module.exports = ({$req}) => ({


  /**                                                                    event(
  * Track a named application specific event. Requires a previous middleware
  * (e.g. logic) to set req.locals.r
  *
  *  String    @name of the event being tracked
  *  Function  @onTrack hook to log event and/or perform customer behavior.
  *              req props accessible via this and event name & data as args
  *  Object    @opts[optional] see DRY.track @opts
  *    Function  .onTracked optional callback, mainly useful for testing purposed
  *    Function  .onBot hook to log and/or perform custom behvior with
  *                                                                         )*/
  event(name, onTrack, opts) {
    this.mwName = `event:${name}`
    opts = opts || {}
    var onTracked = opts.onTracked
    var onBot = opts.onBot || onTrack
    var project = opts.project || (d=>d?d:{})
    var skip = opts.skip || (req=>false)

    return function(req, res, done) {
      if (skip(req)) return done(null, $req.SKIP)

      var track = $req.byBot(req,'event') ? onBot : onTrack

      req.analytics = { event: name }
      res.once('finish', () => {
        // Allows to set/override data and event name at prev point in mw.chain
        var final = req.analytics
        // $log('on.finish.event'.white, req.ctx, req.analytics)
        track(req, final.event, project(final.data||req.locals.r), onTracked)
      })

      done(null, `${name}:${req.originalUrl}`)
    }
  },


  /**                                                               impression(
  * Track the display of an advertisement. Requires a previous middleware
  * (e.g. param or recast) to set req.ad
  *
  * ..
  *                                                                         )*/
  impression(onTrack, opts) {
    var opts = opts || {}
    var type = opts.type || 'ad'
    var onTracked = opts.onTracked
    var onBot = opts.onBot || onTrack
    var project = opts.project || (d=>d)
    var skip = opts.skip || (req=>false)

    return function(req, res, done) {
      if (skip(req)) return done(null, $req.SKIP)

      var data = req.analytics ? req.analytics.data : req.locals.r
      var track = $req.byBot(req,'impression') ? onBot : onTrack

      track(req, project(assign(data)), onTracked)

      var {bot,ref} = req.ctx
      done(null, `${type}${bot?'[bot]':''} ${ref?'<<< '+ref:''}`)
    }
  },



  /**                                                                     view(
  * Track a view of a domain object by its url. Requires a previous middleware
  * (e.g. param or recast) to set req[type]. Useful for use cases like stats
  * on blog posts, capturing user browsing interests & logging unexpected
  * access to secure data.
  *
  *  String    @type of the object being access/viewed
  *  Function  .onTrack fn to log view
  *  Object    @opts[optional]
  *   Function  .onTracked optional callback, mainly useful for testing purposed
  *   Function  .onBot custom fn handle bots, defaults to onTrack if undefined
  *   Function  .project optionally shape view object to desired data
  *   Function  .skip optional fn with req as argument to skip tracking
  *               useful for scenarios like running fast integration tests
  *                                                                         )*/
  view(type, onTrack, opts) {
    this.mwName = type == 'ad' ? 'adclick' : `view:${type}`
    opts = opts || {}
    var onTracked = opts.onTracked
    var onBot = opts.onBot || onTrack
    var project = opts.project || (d=>d)
    var skip = opts.skip || (req=>false)

    return function(req, res, done) {
      if (skip(req)) return done(null, $req.SKIP)

      var data = req.analytics ? req.analytics.data : req.locals.r
      var track = $req.byBot(req,'view') ? onBot : onTrack

      track(req, type, project(assign(data)), onTracked)

      var {bot,ref} = req.ctx
      // $log('mw.view'.yellow, `${type}${bot?'[bot]':''} ${ref?'<<< '+ref:''}`)
      done(null, `${type}${bot?'[bot]':''} ${ref?'<<< '+ref:''}`)
    }
  }
})

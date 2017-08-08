module.exports = ({Logic,DAL,$mw,$req}) => ({


  /**                                                                   cached(
  * Allows utilization of asynchronous cache synchronously later
  * in the middleware chain (decreasing code complexity a lot)
  *
  * String     @key of the item in cache to ensure is loaded
  * Function   @getter
  * Object     @opts
  *   Object     .cache instance
  /                                                                         )*/
  cached(key, getter, opts) {
    this.mwName = `cached:${key}`
    opts = opts || {}
    var cache = opts.cache || global.cache
    if (!cache) throw Error(`mw.cache requires opts.cache or global.cache`)
    var hashBy = opts.hashBy
    var hashFn = !hashBy ? null : function(list) {
      var hash = []
      for (var o of list) hash[o[hashBy]] = o
      return hash
    }

    var self = this
    return function(req, res, done) {
      var cb = (e, r) => {
        $mw.name.call(self, 'data', `cached:${key}`, req) //-- interesting race condition to refactor for
        done(e, e ? null : `${key}`)
      }

      hashFn ? cache.collectionReady(key, getter, hashFn, cb)
             : cache.get(key, getter, cb)
    }
  },


  /**                                                                    param(
  *
  *
  *  String    @model name of entity to retrieve + attribute
  *              on the request used to store the result
  *  Object    @opts[optional]
  *   String    .queryKey name of the attr to search on. When not
  *              provided defaults to find by '_id' attribute
  /                                                                         )*/
  param(model, opts) {
    this.noWrap = true
    opts = opts || {}
    var required = opts.required || false
    var modelName = model[0].toUpperCase() +
                    model.replace(model[0],'')
                         .replace(/s$/,'')
    
    return function(req, res, done, val) {
      $mw.trace($mw.name('data', `param:${model}`, req))
      if (val) val = val.trim()
      if (val == undefined || val == 'undefined' || val == null) {
        res.status(404).json({message:`${model} Not Found. Request param ${model} missing`})
        var e = assign(Error(`Query input req.params.${model} not defined`),{status:404})
        return $mw.done(e, `req.param.${model} ${val}`, $req.STOP)
      }
      var q = {}
      q[opts.queryKey||'_id'] = val
      DAL[modelName].getByQuery(q, opts.queryOpts || {}, (e,r) => {
        if (!r && !e)
          e = assign(Error(`${model} not found`),{status:404})
          // res.status(404).json({message:`${model} not found`})

        req[model] = r
        $mw.done(e)
        done(e, `${model}.${val} ${r?r._id:'NotFound'}`)
      })
    }
  },


  /**                                                                   recast(
  * Same as express(JS) .param not limited to reading input from url.
  *
  *  String    @model name of entity to retrieve + attribute
  *              on the request used to store the result
  *  String    @src property on the request (can be nested) to use as
  *              input. E.g. 'body', 'body.userid', 'query.searchTerm'
  *              and 'user.company.admin.email' are ok (if they exist)
  *  Object    @opts[optional]
  *   String    .dest override of attribute name to store on request
  *   String    .queryKey an attribute other than '_id' to query on
  *   Object    .queryOpts any DA getter opts e.g. { limit: N }
  *   Boolean   .required if true will stop response and return 404
  *   Boolean   .multi if true returns array of results rather than first
  *                                                                         )*/
  recast(model, src, opts) {
    this.mwName = `recast:${model}`
    opts = opts || {}
    var key = opts.queryKey || '_id'
    var dest = opts.dest || model
    var required = opts.required || false
    var merge = opts.merge || false
    var project = opts.project || undefined
    var multi = opts.multi === false ? opts.multi : opts.multi || dest.match(/s$/)
    var getter = multi ? 'getManyById' : 'getById'
    var modelName = model[0].toUpperCase() +
                    model.replace(model[0],'')
                    .replace(/s$/,'')

    if (!DAL || !DAL[modelName] || !DAL[modelName][getter])
      throw Error(`middleware recast.init fail. DAL.${modelName}.${getter} not defined`)

    return function(req, res, done) {
      var val = _.get(req, src)
      var query = multi ? val : _.set({}, key, val)
      var logData = `${(key+' =>').dim} ${modelName}.${getter}(${('req.'+key).dim}|${JSON.stringify(query)})`
      if (val == undefined || val == null) {
        if (!required) return done(null, logData)
        res.status(404).json({message:`${model} Not Found. Request input ${key} missing`})
        return $mw.done(Error(`Query input unavailable from req.${key}`), logData, $req.STOP)
      }
      DAL[modelName][getter](query, opts.queryOpts, function(e, r) {        
        if (required && (!r||r.length==0) && !e)
          res.status(404).json({message:`${model} Not Found`})
        if (project) r = project(r)
        req[model] = merge ? assign(req[model]||{}, r||{}) : r
        if (dest != model) _.set(req, dest, r)
        done(e, logData, required && (!r||r.length==0) && !e)
      })
    }
  },


  /**                                                                  project(
  * Shape data sent to the client (already set on req.locals.r)
  * Very handy for:
  * (1) Optimizing response (size) with necessary info only
  * (2) Enforcing "need to know" access to users with varying privileges
  * (3) Inflating / combining with data from cache
  *
  * String     @name usually the Object path of the projectFn
  * Function   @projectFn function that knows how to take input and
  *              project the shaped output
  *                                                                         )*/
  project(name, projectFn) {
    this.mwName = `project:${name}`
    if (!(name && projectFn)) throw new Error(`middleware ${this.mwName}.init fail. arg not defined`)

    return function(req, res, done) {
      if (req.locals.r)
        req.locals.r = projectFn(req.locals.r)
      done()
    }
  },


  /**                                                                    valid(
  * STOP RIGHT THERE ending execution of middleware chain if input
  * data does not meet requirements. A clean way to perform
  * server-side validation separate to and before any logic runs
  *
  * String     @name usually the Object path of the projectFn
  * [String]   @src array of properties on the request (can be nested) to
  *              use as input. E.g. 'body', 'param.id', 'query'
  * Function   @validate fn that return a string describing the first
  *              validation failure or null if validation passes
  * Object     @opts[optional]
  *   String   .responseType json / html
  *   String   .responseTemplate
  *                                                                         )*/
  valid(name, src, validate, opts) {
    if (!(name && validate)) throw new Error(`middleware valid:${name}.init fail. arg not defined`)
    this.noWrap = true
    this.mwName = `data.valid:${name}`
    opts = opts || {}

    return function(req, res, next) {
      $mw.trace($mw.name('data',`valid:${name}`, req))

      var args = _.map(src, key => _.get(req,key))
      args.unshift(req.user)
      var inValid = validate.apply(null, args)
      if (!inValid) return next()

      var error = { message:`${'fail:'} `+`${inValid}`, status: 403 }

      if (opts.responseType == 'html')
        res.status(error.status).render(opts.responseTemplate||'error', {error,user:req.user})
      else
        res.status(error.status).json(error)

      $mw.done(error, `${JSON.stringify(req.body).replace(/\"([^(\")"]+)\":/g,"$1:".dim)}`, $req.STOP)
    }
  },


  /**
  //-- Probably not the right place for this now as it came from one of the
  //-- first versions of this framework. Left here for fun as it's an original
  //-- iteration of one of the main ideas that instigated starting things.
  //-- Now you're better off chaining data.valid().logic.safe().data.project()
  */
  logic(namespace, fnName, argsMap) {
    this.mwName = `logic:${namespace}.${fnName}`

    var logic = Logic[namespace][fnName]
    if (!logic) throw new Error(`[mw.data.logic] fail init. Logic ${namespace}.${fnName} not defined`)

    return function(req, res, done) {
      var {session,sessionID,user,ctx} = req
      var args = _.map(argsMap, key => _.get(req,key))

      // $mw.trace($mw.step('validate'))
      // var inValid = logic.validate &&
      //       logic.validate.apply(this, _.union([req.user],args))

      // if (inValid)
      //   return done(Forbidden(inValid))

      var callback = (e, raw) => {
        // if (global.analytics && analytics.event && analytics.tracking[fnName])
        //   analytics.event.apply(req, analytics.tracking[fnName](Object.assign({user:req.user},raw||{})))

        if (logic.project && raw)
          $mw.trace($mw.step('project'))

        var r = !e && raw && logic.project ? logic.project.call(req, raw) : raw
        Object.assign(req.locals, {r})
        done(e)
      }

      args.push(callback)
      $mw.trace($mw.step('exec'))
      logic.exec.apply({session,sessionID,user,ctx}, args)
    }
  }


})


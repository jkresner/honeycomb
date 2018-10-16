module.exports = ({DAL,$mw,$req}) => ({

  /**
  */
  api(namespace, op, argsMap) {
    this.mwName = `api:${namespace}.${op}`

    var opFns = honey.logic[namespace][op]
    if (!opFns) throw Error(`mw.data.api fail: logic.${namespace}.${op} undefined`)

    return function(req, res, done) {
      let ctx = _.pick(req,['session','sessionID','user','ctx'])
      let args = _.map(argsMap, key => {
        let val = _.get(req,key)
        if (val && val.constructor === Object)
          return assign({}, val)
        return val
      })
      args.push((e, r) => {
        if (e) {
          if (e.status == 403) {
            // helpful to output failed at validate
            $mw.step('validate')
            res.status(403).json({message:e.message}).end()
            done(null, e.message.magenta.dim, $req.STOP)
          } else {
            done(e, "logic fail")
          }
        } else {
          req.locals = assign(req.locals||{}, {r})
          done(null, "logic ok")
        }
      })
      opFns.chain.apply(ctx, args)
    }
  },

  /**
  *  Due for a rewrite
  */
  page(path, opts={}) {
    opts.data = opts.data || []
    opts.params = opts.params || []
    opts.assign = opts.assign || false
    let [group,op] = path.split('.')
    let logic = honey.logic[group][op]

    this.mwName = `op:${op}`

    return function(req, res, next) {
      var args = [(e,r) => {
        if (e) {
          if (config.env != 'dev') $log('mw.data.page.err'.red, e)
          else next(e)
        }
        if ((r||{}).htmlHead)
          req.locals.htmlHead = assign(req.locals.htmlHead||{},r.htmlHead)
        if (!r && opts.required !== false)
          e = assign(Error(`Not Found data::${req.originalUrl}`),{status:404})
        if (!e) {
          req.locals.r = req.locals.r || {}
          if (opts.assign) req.locals.r[opts.assign] = r
          else req.locals.r = r
        }
        return next(e)
      }]

      for (let arg of opts.data) args.unshift(arg)
      for (let arg of opts.params) req.params[arg] = req[arg]
      for (let arg in req.params) args.unshift(req.params[arg])

      if (!/get/i.test(req.method) && !logic.validate)
        throw Error(`mw.logic fail: ${path}.validate not defined`)

      logic.chain.apply(req, args)
    }
  },

  /**                                                                   cached(
  * Allows utilization of asynchronous cache synchronously later
  * in the middleware chain (decreasing code complexity a lot)
  *
  * String     @key of the item in cache to ensure is loaded
  * Function   @getter
  * Object     @opts
  *   Object     .cache instance
  /                                                                         )*/
  cached(key, getter, opts={}) {
    this.mwName = opts.name || `cached:${key}`

    let cache = opts.cache || global.cache
    if (!cache) throw Error(`mw.cache requires opts.cache or global.cache`)

    let hashBy = opts.hashBy
    let hashFn = !hashBy ? null : function(list) {
      let hash = []
      for (let o of list) hash[o[hashBy]] = o
      return hash
    }

    return function(req, res, done) {
      let cb = (e, r) => {
        if (!e && r && opts.assign)
          _.set(req, opts.assign, r)

        done(e, e ? null : `${key}`)
      }

      hashFn ? cache.collectionReady(key, getter, hashFn, cb)
             : cache.get(key, getter, cb)
    }
  },


  /**                                                                    param(
  * Used for app.API().params()
  *
  *  String    @model name of entity to retrieve + attribute
  *              on the request used to store the result
  *  Object    @opts[optional]
  *   String    .queryKey name of the attr to search on. When not
  *              provided defaults to find by '_id' attribute
  /                                                                         )*/
  // param(model, opts) {
  //   this.noWrap = true
  //   opts = opts || {}
  //   var required = opts.required || false
  //   var modelName = model[0].toUpperCase() +
  //                   model.replace(model[0],'')
  //                        .replace(/s$/,'')

  //   return function(req, res, done, val) {
  //     $mw.trace($mw.name('data', `param:${model}`, req))
  //     console.log('mw.param.val'.magenta, val)
  //     console.log('mw.param.params'.magenta, req.params)
  //     if (val) val = val.trim()
  //     if (val == undefined || val == 'undefined' || val == null) {
  //       res.status(404).json({message:`${model} Not Found. Request param ${model} missing`})
  //       var e = assign(Error(`Query input req.params.${model} not defined`),{status:404})
  //       return $mw.done(e, `req.param.${model} ${val}`, $req.STOP)
  //     }
  //     var q = {}
  //     q[opts.queryKey||'_id'] = val
  //     DAL[modelName].getByQuery(q, opts.queryOpts || {}, (e,r) => {
  //       if (!r && !e)
  //         e = assign(Error(`${model} not found`),{status:404})
  //         // res.status(404).json({message:`${model} not found`})

  //       req[model] = r
  //       $mw.done(e)
  //       done(e, `${model}.${val} ${r?r._id:'NotFound'}`)
  //     })
  //   }
  // },


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
  recast(model, src, opts = {}) {
    this.mwName = opts.mwName || `recast:${model}`
    var key = opts.queryKey || '_id'
    var dest = opts.dest || model
    var required = opts.required || false
    var merge = opts.merge || false
    var project = opts.project || undefined
    var multi = opts.multi === false ? opts.multi : opts.multi || dest.match(/s$/)
    var getter = multi ? 'getManyById' : 'getByQuery'
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

      // error
      $mw.done(null, `${JSON.stringify(req.body).replace(/\"([^(\")"]+)\":/g,"$1:".dim)}`, $req.STOP)
    }
  }


})


var Instrument = function(cfg) {  

  var traceOn = cfg && cfg.trace  // consider renaming "trace" to "chain"
  var filterOut = process.env.INSTRUMENT_FILTER
                    ? new RegExp(process.env.INSTRUMENT_FILTER)
                    : '/test/'

  //-- logs execution (in order) at the beginning of ALL invoked mw
  var trace = () =>
    this.logIt||traceOn && !this._current.match(filterOut)
        ? console.log((this._current||this._name)[cfg.trace]) : null

  var step = (step) => this._current = `${this._name}${('.'+step)}`

  var done = (e, data, stop) => {
    var d = data || 'no data...'
    if (e && this._logIt)
      console.log(`${this._name}`.red, `${e.message}`[this._logIt].dim, this._uid, d.gray)
    else if (e && data && !(/test/.test(config.env) && process.env.LOG_APP_TERSE)) // only output if data provided (e.g. mw.res.forbid)
      console.log(`${this._name}`.red, `${e.message}`.white, d)
    else if (this._logIt)
      console.log(`${this._name}`[this._logIt], d.gray)
  }

  var name = (group,fn,{user,ctx,method,originalUrl}) => {
    this._uid = (user ? user.name :'anon'+(ctx?ctx.ip||'':'')).white.bold
    this._fn = fn
    this._logIt = cfg ? cfg[fn.split(':')[0]] : undefined
    this._name = `${('['+method.substring(0,3)+originalUrl+']').dim}${fn}`
    this._current = this._name
    return this
  }

  var prettyError = (e, ctx) => {
    var ref = ctx && ctx.ref ? ` << ${ctx.ref}`.blue : ''
    if (!e.stack) return `STRING ERR: ${e}${ref}`
    if (ctx.ud && ctx.ud != 'other') return `ERR.byUD[${ctx.ud}]: ${e.message||e}${ref}`
    if (e.status && e.status == 404) return `${e.message}${ref}`
    var filtered = []
    var lines = (e.stack || e).split('\n')
    for (var line of lines)
      if (!line.match(filterOut)) filtered.push(line)

    return `${_.take(filtered, 20).join('\n')}${ref}`
  }

  return { name, trace, step, done, prettyError }

}


module.exports = () => {

  var cfg = honey.cfg('log.it.mw')
  var instrument = Instrument(cfg)

  instrument.wrap = (groupName, baseName, fn) => function() {
    var naked = fn.apply(this, arguments)

    var mwName = this.mwName||baseName
    if (this.mwName)
      delete this.mwName
    if (this.noWrap) {
      delete this.noWrap
      return naked
    }

    LOG('mw.init', `INIT`, `${groupName}.${mwName}`)
    return (function(instanceName, mwFn) {
      return function(req, res, next) {
        instrument.name(groupName, instanceName, req)
        instrument.trace()
        mwFn.call(this, req, res, (e, logData, stop) => {
          //-- bit ugly, but v.helpful
          // if (cfg.testDone) return next(e, logData, stop)
          instrument.done(e, logData, stop)
          
          if (e) return next(e)
          else if (!(res.headersSent || stop)) return next()
        })
    }})(mwName, naked)
  }


  return instrument

}

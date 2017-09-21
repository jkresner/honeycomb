var Instrument = function() {
  let cfg = honey.cfg('log.it.mw')
  let {verbose,quiet} = honey.cfg('log')
  let traceOn = (cfg||{}).trace && !quiet  // consider renaming "trace" to "chain"
  let mute = new RegExp(process.env.LOG_IT_MW_MUTE||'test')

  //-- logs execution (in order) at the beginning of ALL invoked mw
  var trace = () =>
    (!!verbose || (this.logIt||traceOn && !mute.test(this._fn)))
        ? console.log((this._current)[cfg.trace||'cyan']) : null

  var step = (step) => {
    this._current = `${this._name}${('.'+step)}`
    return this._current
  }


  var data = (req) => {
    let logFilter = /Pingdom|Sogou|CloudFlare-Always/
    if (logFilter.test(req.ctx.ua)) return
    let {ctx,originalUrl} = req
    let ref = ctx.ref ? ` <<< ${ctx.ref.dim}` : ''
    let sId = (!ctx.sId || ctx.sId == 'unset' ? '_          _' : ctx.sId).substr(0,12)
    let ip = ctx.ip + '                '.substr(0, 16-ctx.ip.length)
    let UD = `[${this._fn}] ${ctx.ud.magenta}` + '                            '.substr(0,18-(this._fn+ctx.ud).length)
    let u = ((ctx.user||{}).name||'')
    let method = req.method.substr(0,3).cyan.dim
    console.log(`${sId} ${ip} ${UD} ${method}`.cyan.dim+` ${originalUrl.magenta}${ref} ${u.white} `+`${ctx.ua||'ua:null'}`.gray)
  }


  var done = (e, data, stop) => {
    let d = data || 'no data...'
    let col = this._logIt||'dim'
    if (e && stop)
      console.log(`${this._current}`.red, `${e.message}`[col], this._uid, d.gray)
    else if (this._logIt)
      console.log(`${this._current}`[this._logIt], d.gray)
  }

  var name = (group,fn,{user,ctx,method,originalUrl}) => {
    this._uid = (user ? user.name :'anon'+(ctx?ctx.ip||'':'')).white.bold
    this._fn = fn
    this._logIt = cfg ? cfg[fn.split(':')[0]] : undefined
    this._name = `${('['+method.substring(0,3)+originalUrl+']').dim}${fn}`
    this._current = this._name
    return this
  }

  return { name, trace, step, data, done }
}


module.exports = () => {

  let instrument = Instrument()

  instrument.wrap = (groupName, baseName, fn) => function() {
    let naked = fn.apply(this, arguments)
    let mwName = this.mwName||baseName
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
          instrument.done(e, logData)
          if (!res.headersSent && !stop)
            next(e)
        })
    }})(mwName, naked)
  }

  return instrument

}

var $req = { STOP: true, SKIP: 'skip' }
$req.byBot = ({ctx}, mwName) => {
  if ((ctx||{}).hasOwnProperty('ud')) return /(ban|lib|search|proxy|reader|bot|null)/.test(ctx.ud)
  throw Error(`middleware ${mwName}.byBot fail. mw.wrap opts.context.bot configuration missing`)
}
$req.uid = function(req) {
  var ctx = req.ctx
  if (ctx.user && ctx.user.name) return ctx.user.name
  else if (ctx.sId && ctx.sId != 'unset') return ctx.sId.substring(0,16)
  else if ((ctx.ua||'') != '' && ctx.ud) return ctx.ua.split(' ')[0]
  return ctx.ip
}
$req.idCtx = (r) => {
  if (!r.ctx) return
  if (r.ctx.hasOwnProperty('sId')) r.ctx.sId = $req.ctx.sId(r)
  if (r.ctx.hasOwnProperty('user')) r.ctx.user = $req.ctx.user(r)
}

/**                                                                      ctx(
* Slightly intelligent (+ incomplete) convenience obj with request info
*                                                                         )*/
$req.ctx = {
  set: (req, cfg, key) => {
    if (!cfg[key]) return
    let val = $req.ctx[key](req, cfg[key])
    if (val !== undefined) assign(req.ctx,{[key]:val})
  },
  user: r => r.user ? {_id:r.user._id,name:r.user.name} : null,
  sId: r => r.sessionID || 'unset',
  // TODO check special cloudflare ip header
  ip: r => (r.headers['x-forwarded-for'] || r.connection.remoteAddress).split(',')[0],
  ref: r => r.header('Referer'),
  ua: r => {
    let raw = r.get('user-agent')
    if (raw && raw != "null" && raw.trim() != "") return raw
  },
  ud: (r, categories) => {
    let ua = r.get('user-agent')
    if (!ua||ua.match(/(null|undefined)/i)) return 'null'
    let matched = false
    for (var pattern in categories)
      if (categories[pattern].test(ua))
        matched = matched ? `${matched}|${pattern}` : pattern
    return matched || 'nomatch'
  },
  utm: r => !r.query ? undefined : 'campaign source medium term content'
          .split(' ').filter(u => r.query[`utm_${u}`]).forEach(u =>
            r.ctx.utm = assign(r.ctx.utm||{},{[u]:r.query[`utm_${u}`]}))
}


module.exports = $req

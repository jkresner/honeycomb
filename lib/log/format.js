var colors         = require('colors')
var util           = require('util')
var stamps         = new Map(),
    timed          = new Map()

//-- Flatten  global.config.log.{ns}.{feature}
//-- to       flattened[`{ns}.{feature}`]
//-- to pass into colors.setTheme()

function setColorTheme(cfg) {
  var flattened = {}
  for (var namespace in cfg)
    Object.keys(cfg[namespace]).forEach(feature =>
      flattened[namespace+'.'+feature] = cfg[namespace][feature])

  colors.setTheme(flattened)
}
setColorTheme(honey.cfg('log.it'))


function pretty(input, width, key) {
  if (!input.constructor || input.constructor !== String)
    input = input.toString()

  var pad = ''
  while (pad.length+input.length < width-1) pad+=' '
  var fixed = (input+pad).slice(0,width-1)+' '

  return colors[key] ? fixed[key] : fixed
}


function request(req, {body,ud}) {
  var str = util.format('[%s%s]%s\n%s\n%s\n%s\n\n',
  req.method, `${req.originalUrl}`,
  req.header('Referer') ? `\n<< ${req.header('Referer')}` : '',
  (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0],
  req.header('user-agent')?req.header('user-agent'):'UA:null',
  req.user ? `${req.user.name} ${req.user._id}` : req.sessionID)

  if (ud) str += (`\n ud:` +
    req.header('user-agent') ? ((req.ctx||{}).bot!=undefined?req.ctx.ud:'other') : 'UA:null')

  if (body && !req.method.match(/(get|delete)/i))
    str += `\n\n ${JSON.stringify(req.body)}`

  return str
}


function error(e, maxLines) {
  return util.format.call(this, _.take((e.stack || e).split('\n')
    .filter(ln => !ln.match('_modules|native') || ln.match('honey')), maxLines||20)
    .map(str => str.replace("  at ", ''))
    .map(str => str.replace("(",'').replace(")",'').split(' '))
    .map(words => words[0].red + ' ' + _.rest(words,1).join(' ').white)
    .join('\n  '))
}


function line() {  
  var args = [].slice.call(arguments)
  var scope = args.shift()
  if (colors[scope]) {
    var namespace = scope.split('.')[0]
    args[0] = pretty(args[0], 24, scope)
    args.unshift(pretty(namespace, 4, scope).dim)
    return util.format.apply(this, args)
  }
}


function time(label, msg) { 
  var now = Date.now()
  var lastStamp = stamps.get(label)
  var start = timed.get(label)
  if (!start) timed.set(label, now)

  stamps.set(label, now)

  return util.format.apply(this, ['%s%s%s%s',
    pretty(label, 5, 'app.init'),
    pretty(now-(start||now), 6, 'app.lapse'),
    pretty(now-(lastStamp||now), 5, 'app.sublapse'),
    pretty(msg, 20, 'app.init')])
}


function track(type, d, {user,sId,ip,ref}) {
  if (!honey.cfg('log.it.trk.${type}')) return

  var ident = user != null ? `${user.name||user._id}`.gray : `${sId.substring(0,12)}`.cyan

  var jdata = ''
  if (type == 'view') jdata =
    `${(d.url||'').cyan} ${ref?ref.replace(/https\:\/\/|http\:\/\//g,'<<< ').replace('www.','').blue:''}`
  else if (type == 'issue') jdata =
    `${d.name.white} ${(d.url||'').gray} ${ref?ref.replace(/https\:\/\/|http\:\/\//g,'<<< ').replace('www.','').blue:''}`
  else
    JSON.stringify(d.data||{}).replace(/^\{/,'').replace(/\}$/,'').replace(/\"([^(\")"]+)\":/g,"$1:".dim).gray
  var label = type
  if (type == 'issue') label = d.type
  if (type == 'event') label = d.name
  if (type == 'view') label = `VIEW:${d.type}`
  line(`trk.${type}`
    , label.toUpperCase()
    , `${ip.replace(':ffff','')}`.cyan+`\t${ident}`
    , jdata
  )
}

module.exports = { error, line, time, request, track }



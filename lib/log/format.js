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

function strip(str) {
  return colors.strip(str)
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

const nodeInternal = '(coffee-script|mocha)/lib|\\((vm|timers|module).js'
// const nodeInternal = '_resolveFilename|_modules|_load|native|timers.js'
const currentDir = process.cwd()

function error(e, maxLines=20) {
  // console.log('nodeInternal'.blue, nodeInternal)
  let lines = (e.stack||e).split('\n  at').map(l=>l.trim()).filter(l=>l!='')
  let first = lines.shift().red+'\n'
  let rest = _.take(lines.filter(l => {
    // console.log('ln', l)
    // console.log('ln', l.match(nodeInternal))
    return !l.match(nodeInternal) // || l.match('honey')
  }), maxLines-1)
  // console.log('stack:\t'.cyan, e.stack)
  // console.log('first:\t'.cyan, first)
  // console.log('rest:\n'.cyan, rest)
  // rest = rest
    .map(str => str.trim().replace("  "," ").replace(currentDir,''))
    .map(str => str.replace("(",'').replace(")",'').split(' '))
    .map(words => words.join(' ').replace(words[0], words[0].red).split(':'))
    .map(([info,ln]) => `  ${ln}\t`.gray.dim+`${info}`.dim)
    .join('\n')

  return util.format.call(this, `%s%s`, first, rest)
}


//-- used by COMM for emailing errors
function issue({e, req, filter})
{
  var txt = `No request context`

  if (req) {
    var {user,ctx} = req
    var ref = (ctx||{}).ref || req.header('Referer')
    var sId = (ctx||{}).sId || req.sessionID
    var ua = (ctx||{}).ua || req.header('user-agent')
    var ud = (ctx||{}).ud ? `\nud:  ${ctx.ud}` : ''
    var usr = user ? `\n_id: ObjectId("${user._id}") ${user.name} ${user.email||user.username||''}` : ''
    var body = !/get|delete/i.test(req.method) && req.body ? `\n\n${JSON.stringify(req.body)}` : ''
    var url = req.originalUrl.indexOf("http") == 0 ? req.originalUrl : config.http.host+req.originalUrl

    txt = `
${req.method} ${url}${ref ? '\n << '+ref:''}

${req.headers['x-forwarded-for'] || req.connection.remoteAddress}
sid: ${sId}
ua:  ${ua||'null'}${ud}${usr}${body}`
  }

  var stack = e.stack || ''
  if (filter) stack = stack.split('\n').filter(ln => !filter.test(ln)).join('\n')

  return `${e.message||e}\n${txt}\n\n${stack}\n\n${moment()}\n${(req||{}).hostname||''}`
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

  return line(`trk.${type}`
    , label.toUpperCase()
    , `${ip.replace(':ffff','')}`.cyan+`\t${ident}`
    , jdata
  )
}


// Logic chain execution context this.props & other intentionally tracked data
function op(data) {
  var {act}  = data
  var ctx = act ? `${act}() => \n`.cyan : ''
  if (act) delete data.act
  for (var attr in data)
    ctx += `\n  ${pretty(attr, 14, 'blue')}${json(data[attr])}`
  return ctx
}


function json(obj, opts = {}) {
  let name = (opts.name||'').yellow
  return name + (obj && Object.keys(obj).length > 0)
    ? ` ${JSON.stringify(obj).replace(/\"([^(\")"]+)\":/g,"$1:".dim).gray}` : ' !Object'
}


module.exports = { error, issue, json, line, op, request, strip, time, track }

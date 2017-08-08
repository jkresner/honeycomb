module.exports = function(app, config) {

  var opts = config.templates

  if (opts.model)
    honey.model.importSchemas(join(__dirname,'model'),{enums:false})

  var engines = opts.engines.split(',')
  var hbs = engines.indexOf('hbs')==-1 ? null : require('hbs')
  var marked = engines.indexOf('marked')==-1 ? null : require('marked')
  var tmpls = { compiled: {} }

  if (app && opts.dirs.views) 
    require('./templates.views')(app, {hbs,marked})
  
  if (hbs) {
    // tmpls.handlebars = 
    global.handlebars= hbs.handlebars
    tmpls.handlebarIt = (tmplStr, data) => handlebars.compile(tmplStr)(data)
  }
  if (marked) 
  { 
    tmpls.markIt = (tmplStr) => marked(tmplStr)
    global.marked = marked
  }

  tmpls.add = function(key, fn) {
    if (this.compiled[key] || cache.templates[key])
      throw Error(`Template.add(<string> key) fail. ${key} exists.`)

    this.compiled[key] = fn
  }
  
  // `key === ${name}.${transport}`
  tmpls.get = function(key) {
    // if (/(smtp|ses)/.test(transport)) transport = 'mail'
    
    // var key = `${templateName}.${transport}`
    if (this.compiled[key]) 
      return this.compiled[key]

    if (cache.templates[key])
      return cache.templates[key]
    
    throw Error(`${key} not in cache`)
    // if (!template[transport]) invalid = `has no ${transport} definition`
    // var invalid = this.validateTemplateTransport(template, transport)
    // if (invalid) throw Error(`Template[${key}] fail. ${invalid}`)

    // this.compiled[key] = {}
    // for (var attr in template[transport])
      // this.compiled[key][attr] = handlebars.compile(template[transport][attr])

    // return this.compiled[key]
  }

  //e.g. template = { subject: fn, txt: fn, html: fn }
  tmpls.renderParts = function(template, data) {
    var rendered = {}
    for (var attr in template) {
      if (template[attr].constructor !== Function)
        throw Error(`Honey.templates ${template}.${attr} not a fn`)
      rendered[attr] = template[attr](data)
    }
    return rendered
  }


  TIME(`INITED     Templates`)

  return tmpls
}




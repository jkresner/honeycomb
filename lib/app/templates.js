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
  

  // key = `${templateName}:${transport}`
  tmpls.get = function(key) {
    var t = null
    
    if (this.compiled[key]) 
      t = this.compiled[key]

    if (cache.templates[key])
      t = cache.templates[key]
    
    if (!t)
      throw Error(`${key} not in cache`)
    
    return assign({
      render(data) { return tmpls.renderParts(t, data) }
    }, t)
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




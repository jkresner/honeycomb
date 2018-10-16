module.exports = function(app, config) {

  var opts = config.templates

  if (opts.model)
    honey.model.importSchemas(join(__dirname,'model'),{enums:false})

  var engines = opts.engines.split(',')
  var hbs = engines.indexOf('hbs')==-1 ? null : require('hbs')
  var marked = engines.indexOf('marked')==-1 ? null : require('marked')

  var tmpls = {
    compiled: {},
    add(key, fn) {
      let CAL = global.CAL || {templates:{}}
      if (this.compiled[key] || CAL.templates[key])
        throw Error(`Template.add(<string> key) fail. ${key} exists.`)

      this.compiled[key] = fn
    },
    get(key) { // key = `${templateName}:${transport}`
      var t = null

      if (this.compiled[key])
        t = this.compiled[key]
      else if (global.CAL && CAL.templates[key])
        t = CAL.templates[key]

      if (!t)
        throw Error(`${key} not in CAL[templates]`)

      return assign({
        render(data) { return tmpls.renderParts(t, data) }
      }, t)
    },
    //e.g. template = { subject: fn, txt: fn, html: fn }
    renderParts() {
      let args = [].slice.call(arguments)
      // $log('rendrParts'.yellow, args)
      let template = args.shift()

      if (template.constructor === Function)
        return template.apply(this, args)

      var rendered = {}
      for (var attr in template) {
        if (template[attr].constructor !== Function)
          throw Error(`Honey.templates ${template}.${attr} not a fn`)
        rendered[attr] = template[attr].apply(this, args)
      }
      return rendered
    },
    renderIt() {
      let args = Object.values(arguments) // [].slice.call(arguments)
      let fnKey = args.shift()
      // $log('renderIt'.blue, `${fnKey}`.cyan, args)
      return tmpls.compiled[fnKey].apply(this, args)
    }
  }

  if (hbs) {
    global.handlebars= hbs.handlebars
    tmpls.handlebarIt = (tmplStr, data) => handlebars.compile(tmplStr)(data)
  }
  if (marked) {
    tmpls.markIt = (tmplStr) => marked(tmplStr)
    global.marked = marked
  }

  if (app && opts.dirs.views)
    require('./templates.views')(app, {hbs,marked,tmpls})


  TIME(`INITED     Templates`)

  return tmpls
}




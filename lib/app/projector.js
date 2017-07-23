var hash = require('crypto').createHash
var md5 = str => str ? hash('md5').update(str, 'utf8').digest('hex') : null
var map = fn => function(input, ctx) {
  //-- Can skip writing gaurd code in each projection
  if (input == null) return
  //-- Map single items and or array inputs without thinking
  return input.constructor === Array ? input.map(r => fn(r, ctx)) : fn(input, ctx)
}
var Util = honey.util // { object: require('./../util/object') }


module.exports = {

  '_': {
    assign: Object.assign,

    gravatar: email =>
      email ? `https://0.gravatar.com/avatar/${md5(email)}`
            : $log(`project._.gravatar warn: email undefined`),

    inflate: {},

    map,

    md5,

    newId() {
      return honey.model.DAL.User.newId()
    },

    util: Util,

    // this.md = global.marked
    //-- Select space delimitered string of properties from source object
    //   select(obj, 'name email company.name')
    select: Util.Object.select,

    tmpl(name, data) { return honey.templates.renderParts(
                                honey.templates.get(name), data) }
  },

  add(namespace, {Views={}, Query={}, Opts={}, Projections=(()=>{})}) {
    var projections;

    this[namespace] = this[namespace] || {}
    // this[namespace].View = assign(this[namespace].View||{},View)
    this[namespace].Query = assign(this[namespace].Query||{},Query)
    this[namespace].Opts = assign(this[namespace].Opts||{},Opts)


    //-- Serially chain projections
    //-- arg[0] is the source object/data, followed by
    //-- variable number of projectFn names or fns
    var self = this
    this.chain = function() {
      var args = [].slice.call(arguments)
      var r = args.shift()
      while (args.length > 0) {
        var project = args.shift()
        if (project.constructor === String) {
          var fnPath = project.split('.')
          if (fnPath.length == 1)
            project = projections[project]
          else if (fnPath.length == 2)
          // {
            // console.log('chain.fnPath', project) // (self[fnPath[0]]||{}).Project
            project = self[fnPath[0]].Project[fnPath[1]]
          // }
          else
            throw Error(`Projector.chain() fnPath[${fnPath}] not supported`)

          if (!project)
            throw Error(`projector.${namespace}.chain(fnPath:${project}) failed`)
        }

        r = map(project)(r, this)
      }
      return r
    }

    //-- Default projection fn for each view (very handy for chaining)
    //--   view[viewName](obj) view.session(r)
    this.view = {}
    Object.keys(Views).forEach(name =>
      this.view[name] = this._.map(r => this._.select(r, Views[name])))

    projections = Projections(this._, this)
    this[namespace].Project = this[namespace].Project || {}
    for (var name in projections)
      this[namespace].Project[name] =
        //-- Ignore non-function e.g. objects with nested logic
        projections[name].constructor == Function
          ? this._.map(projections[name], this)
          : projections[name]
  }
}

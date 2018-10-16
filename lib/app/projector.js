var hash = require('crypto').createHash
var md5 = str => str ? hash('md5').update(str, 'utf8').digest('hex') : null
var map = fn => function _map(input, ctx) {
  //-- Can skip writing gaurd code in each projection
  if (input == null) return
  //-- Map single items and or array inputs without thinking
  return input.constructor === Array ? input.map(r => fn(r, ctx)) : fn(input, ctx)
}
var Util = honey.util // { object: require('./../util/object') }


module.exports = {

  '_': {
    assign: Object.assign,

    copy: input =>
      input.constructor == Array ? input.map(o=>assign({},o)) : assign({},input),

    gravatar: email =>
      email ? `https://0.gravatar.com/avatar/${md5(email)}`
            : $log(`project._.gravatar warn: email undefined`),

    id: {
      date: id => Util.BsonId.toDate(id),
      new: x => honey.model.DAL.User.newId(),
      parse: id =>  honey.model.DAL.User.toId(id),
      sort: (list, getter, order=-1) => list.sort((a,b)=>
        order*Util.BsonId.compare(_.get(a,getter),_.get(b,getter)))
    },

    inflate: {},

    map,

    md5,

    /*-- Select space delimited string of attrs from source object
      select(obj, 'name email company.name')                          */
    select: Util.Object.select,


    // this.md = global.marked

    tmpl(name, data) { return honey.templates.renderParts(
                                honey.templates.get(name), data) },

    pl8() { return honey.templates.renderIt.apply(this, arguments) },

    util: Util
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
    this[namespace].chain = function() {
      let args = [].slice.call(arguments)
      let r = args.shift()
      let projects = []
      while (args.length > 0) {
        let project = args.shift()
        let fnName = `${project}`.split('\n')[0]
        projects.push(fnName)
        if (project.constructor === String) {
          let fnPath = project.split('.')
          if (fnPath.length == 1)
            project = projections[project]
          else if (fnPath.length == 2)
          // {
            // console.log('chain.fnPath', project) // (self[fnPath[0]]||{}).Project
            project = self[fnPath[0]].Project[fnPath[1]]
          // }
          else
            throw Error(`Projector.chain() fnPath[${fnPath}:${project}] not supported`)

          if (!project)
            throw Error(`projector.${namespace}.chain(fnPath:${project}) failed`)
        }
        r = map(project)(r, this)
      }
      LOG('modl.proj', `${namespace}.chain.end`, projects.join(" > "))
      return r
    }


    //-- Default projection fn for each view (very handy for chaining)
    //--   view[viewName](obj) view.session(r)
    this[namespace].view = {}
    Object.keys(Views).forEach(name =>
      this[namespace].view[name] = this._.map(r => this._.select(r, Views[name])))


    projections = Projections(this._, this[namespace])
    this[namespace].Project = this[namespace].Project || {}
    for (var name in projections)
      this[namespace].Project[name] =
        //-- Ignore non-function e.g. objects with nested logic
        projections[name].constructor == Function
          ? this._.map(projections[name], this)
          : projections[name]
  }
}

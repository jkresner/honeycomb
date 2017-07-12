module.exports = {

  '_': {
    assign: Object.assign,
    
    inflate: {},

    map: fn => function(input, ctx) {
      //-- Can skip writing gaurd code in each projection      
      if (input == null) return
      //-- Map single items and or array inputs without thinking
      return input.constructor === Array ? input.map(r => fn(r, ctx)) : fn(input, ctx)
    },

    newId() {
      return honey.model.DAL.User.newId()
    },

    // this.md = global.marked
    
    md5: str => 
      str ? hash('md5').update(str, 'utf8').digest('hex') : null,

    //-- Select space delimitered string of properties from source object
    //   select(obj, 'name email company.name')
    select: require('./../util/object').select,
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
            // console.log('chain.fnPath', project) // (self[fnPath[0]]||{}).Project
            project = self[fnPath[0]].Project[fnPath[1]]          
          else
            throw Error(`Projector.chain() fnPath[${fnPath}] not supported`)
        
          if (!project)
            throw Error(`projector.${namespace}.chain(fnPath:${project}) failed`)
        }
        
        r = project(r)
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

      // (fn =>
        // function(src) {
          //-- So we can skip gaurd code in each project function
          // if (src == null) return
          //-- So we can automatically also utilize projections for array inputs
          // return src.constructor === Array ? src.map(r => fn(r, this)) : fn(src, this)
        // }
      // )(project[name])    

  }
}
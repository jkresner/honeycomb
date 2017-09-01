var DRY = {
  id:            honey.projector._.id,
  logAct:        require('../model/logAct'),
  noop:          x => {},
  resject:       (resolve,reject) => (e, r) => e ? reject(e) : resolve(r),
  Unauthorized:  msg => assign(new Error(msg), {status:401}),
  Forbidden:     msg => assign(new Error(msg), {status:403}),
  NotFound:      msg => assign(new Error(msg), {status:404})
}


// TODO consider wiping validate/exec/project so only chained
// is available to call ... feels pretty sexy!
function chained(name, {validate,exec,project}) {
  return function() {
    let args = [].slice.call(arguments)
    let done = args.pop()
    if (validate) {
      let vargs = [this.user].concat(args)
      let invalid = validate.apply(this, vargs)
      if (invalid) return done(DRY.Forbidden(invalid))
    }

    var cb = !project ? done : (e, r) => {
      if (e) return done(e, r)
      try {
        done(e, project(r))
      } catch (ex) {
        ex.honey = { act: `${name}.project`, args, raw: r, user: this.user }
        throw ex
      }
    }

    exec.apply(this, args.concat([cb]))
  }
}



function wire(dir, DRY, opts={}) {
  var {model,projector} = honey
  var logic = {}

  var dry = honey.fs.require(dir, 'dry', [model.DAL, projector, DRY])
  assign(DRY, opts.merge ? {[opts.merge]:dry} : dry)
  // $log('logic.dry', DRY)

  for (var namespace of honey.fs.childDirs(dir)) {
    let nsDir = join(dir, namespace)
    // $log('logic.namespace', nsDir)
    let jsFiles = honey.fs.childJs(nsDir)
    let nsLogicFns = jsFiles.filter(f=>f.indexOf('_')!=0)
    // $log('logic.namespace.jsFiles', jsFiles, nsLogicFns)

    if (jsFiles.indexOf('_data') > -1)
      honey.projector.add(namespace, honey.fs.require(nsDir,'_data'))

    let dependencies = [model.DAL, projector[namespace], DRY]
    // $log('logic.namespace.requireDir', nsDir, nsLogicFns)

    let ops = honey.fs.requireDir(nsDir, {files:nsLogicFns,dependencies})
    // $log('logic.namespace.dependencies', ops)

    logic[namespace] = {}
    for (let op in ops) logic[namespace][op] =
      assign(ops[op], { chain: chained(`${namespace}.${op}`, ops[op]) })
  }

  LOG('app.wire', 'WIRED logic', Object.keys(logic).join('|'), dir)
  return assign({DRY},logic)
}


module.exports = {

  /*                                                                     init()
  *  Called once on honey.init
  *                                                                          */
  init() {
    var dir = config.logic.dirs[0]
    return wire(dir, DRY)
  },

  /*                                                                   extend()
  *  Called for each merge app
  *  App logic comes in groups (folders) if the folder name (namespace)
  *    a. !exist => assign all ops to honey.logic[namespace]
  *    b. exists => assign opts where honey.logic[namespace][op] is undefined
  *                                                                          */
  extend(logic, namespace, dir) {
    // $log('logic.extend', dir)
    var extensions = wire(dir, DRY, {merge:namespace})
    // $log('logic.extended', namespace)
    for (var group in extensions)
      logic[group] = assign(extensions[group], logic[group]||{})

    return logic
  }


}

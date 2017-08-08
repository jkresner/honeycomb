var fs = require('fs')
var sError = status => msg => assign(new Error(msg), {status})
var Status = {
  StatusError:   sError,
  Unauthorized:  sError(401),
  Forbidden:     sError(403),
  NotFound:      sError(404)
}
var DRY = { noop: x => {} } 

function wire(dir, DRY) {
  var logic = {}
 
  for (var namespace of honey.fs.childDirs(dir)) {
    var nsDir = join(dir, namespace)
    var jsFiles = fs.readdirSync(nsDir).filter(f=>/(\.js)$/i.test(f))
    var nsLogicFns = jsFiles.filter(f=>f.indexOf('_')!=0).map(f=>f.replace(/(\.js)$/i,''))

    if (jsFiles.indexOf('_data.js') > -1)
      honey.projector.add(namespace, honey.fs.require(nsDir,'_data'))
    
    var dependencies = [honey.model.DAL, honey.projector[namespace], DRY]    

    logic[namespace] = honey.fs.requireDir(nsDir, {files:nsLogicFns,dependencies})
  }

  LOG('app.wire', 'WIRED logic', Object.keys(logic).join('|'), dir)
  return assign({DRY},logic)
}


module.exports = {

  init() {
    var dir = config.logic.dirs[0]
    var dry = honey.fs.require(dir,'dry',[honey.model.DAL, honey.projector])
    assign(DRY, dry, Status)
    return wire(dir, DRY)
  },

  extend(logic, dir) {
    var dry = honey.fs.require(dir,'dry',[honey.model.DAL, honey.projector])
    for (var fnName in dry) {
      if (DRY[fnName] != undefined)
        console.log(`WARN logic DRY fn:!{fnName} overwritten`.magenta)
      DRY[fnName] = dry[fnName]
    }    

    var extensions = wire(dir, DRY)
    for (var namespace in extensions) {
      if (!logic[namespace]) logic[namespace] = extensions[namespace]
      else {
        // Extend parent app logic with extention logic
        assign(logic[namespace], extensions[namespace]||{}, logic[namespace])
      }
    }

    return logic
  }


}
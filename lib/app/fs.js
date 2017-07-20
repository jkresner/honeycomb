// var syntax = require('syntax-error')
var fs = require('fs')
var isDir = (dir) => fs.statSync(dir).isDirectory()
var filterDir = (dir,filter) => fs.readdirSync(dir).filter(filter)
var childDirs = (dir) => filterDir(dir, f=>isDir(join(dir,f)))
var childJs = (dir) =>
      filterDir(dir, f=>f.match(/\.js$/))
        .filter(f => f.indexOf('_') != 0)  //-- convention exclude files like _data.js
        .map(n=>n.replace('.js',''))


//-- like require with:
//--   + dependecy injection
//--   + instrumentation
function $require(dir, file, dependencies) {
  var requiredFile = join(dir,file)
  try {
    var req = require(requiredFile)
    LOG('app.require', `file${dependencies?'()':''}`, requiredFile)
    return dependencies ? req.apply(this,dependencies) : req
  } catch (e) {
    if (e.stack.match('SyntaxError')) {
      // var src = fs.readFileSync(requiredFile+'.js')
      // var err = syntax(src, requiredFile)
      // console.log('\n\n$require.SyntaxError'.red, e.message.gray,
        // err ? `\n\t${err} | col ${err.column}\n\n\n\n`.red : requiredFile.white)
      console.log('e', e)
      process.exit(1)
    }
    else
      console.log('\n\n\nfs.$require.err'.red, requiredFile.white, `\n${e.message}\n${e.stack}\n`)

    throw e
  }
}


function requireDir(dir, opts) {
  if (!opts) opts = { strict: true }
  var {files,dependencies} = opts

  try {
    if (!isDir(dir) && !opts.strict)
      return null
  } catch (e) {
    if (e.message.indexOf('ENOENT')==0)
      return null
  }

  files = files || childJs(dir)

  LOG('app.require', `dir()`, dir)

  var required = {}
  files.forEach(f => required[f] = $require(dir, f, dependencies))

  return required
}

module.exports = {
  childJs,
  childDirs,
  require: $require,
  requireDir
} 


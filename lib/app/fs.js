const fs = require('fs')
const short = (path) => path.replace(process.cwd()+'/','')
                            .replace(join(__dirname, '../'),'honey:')
const isDir = (dir) => fs.statSync(dir).isDirectory()
const filterDir = (dir, filter) => fs.readdirSync(dir).filter(filter)
const childDirs = (dir) => filterDir(dir, f=>isDir(join(dir,f)))
const childJs = (dir, opts={}) =>
  filterDir(dir, f => f.match(/\.js$/))
    .filter(f => opts.exclude ? !opts.exclude.test(f) : f)
    .map(n=>n.replace('.js',''))


/**                                                                   $require(
* Like normal require but wrapped with (i) dependency injection
* (ii) logging
*                                                                           )*/
function $require(dir, file, dependencies) {
  let required = join(dir, file)
  let shortJS = `${short(required)}.js`
  try {
    let r = require(required)
    LOG('app.require', `file${dependencies?'()'.dim:'  '.dim}`
                     , shortJS.replace(file, file.white).gray)
    return dependencies ? r.apply(null, dependencies) : r
  } catch (e) {
    if (!/prod/.test(process.env.ENV)) {
      console.log(`\n ${'$require:'.red} ${shortJS}\n`,
        `\n${honey.log.error(e, 12)}\n\n`,
        `\ttry env.LOG_IT_${'APP_REQUIRE'.cyan}?\n\n`.dim)
      process.exit(1)
    }
    throw e
  }
}

/**                                                                 requireDir(
* Return an object with attrs named same as child JavaScript files
* Powers honey convention over config usage of intrinsic directory structure
* and files in a project for honey Logic, Wrappers etc.
*                                                                           */
function requireDir(dir, opts={strict:true}) {
  let skip = opts.skip || []
  let required = {}

  try {
    if (!isDir(dir) && !opts.strict)
      return null
  } catch (e) {
    if (e.message.indexOf('ENOENT')==0)
      return null
  }


  // Without explicit opts.files exclude _data.js etc. by convention
  let files = opts.files || childJs(dir, {exclude:/^_/})

  LOG('app.require', `dir${'()'.dim}`, short(dir), files, 
    skip.length > 0 ? `skip `.magenta.dim + skip : '')

  files.filter(f => skip.indexOf(f) < 0)
       .forEach(f => required[f] = $require(dir, f, opts.dependencies))

  return required
}


module.exports = {
  childJs,
  childDirs,
  require: $require,
  requireDir
}

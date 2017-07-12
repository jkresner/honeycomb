module.exports = function(config, done) {

  var Util                   = require('./util')
  var fs                     = require('fs')
  var path                   = require('path')
  var mongoose               = require('mongoose')
  var {connection}           = mongoose
  var opened                 = {}

  var Enum                   = require('./_enum')
  var DA = {
    Mongoose:                require('./daMongoose')(mongoose, Enum),
    Mongo:                   require('./daMongo')(mongoose, Enum)
  }

  var model                  = { Enum, DAL: {} }


  model.sessionStore = require('./session')(connection)


  if (config.model.cache)
    model.cache = require('./cache')


  model.connect = function(_config, cb) {
    if (!cb && _config.constructor == Function) {
      cb = _config
      _config = Object.assign({name:'domain'}, config.model.domain)
    }

    var {mongoUrl,name} = _config

    if (opened[mongoUrl]) {
      LOG('modl.connect', `(${name}) REUSING`, mongoUrl)
      return cb ? cb() : null
    }

    var ok = () => {
      LOG('modl.connect', `CONNECTED (${name}) `, mongoUrl)
      if (cb) return cb()
    }


    opened[mongoUrl] = new Date()

    if (name == 'domain') {
      mongoose.connect(mongoUrl)
      connection.on('error', e => {
        console.log(`ERR modl.connect ${name} ${mongoUrl}:`.red, e)
        if (done) done()
      })
      connection.once('open', ok)
    }
    else {
      var db = mongoose.createConnection(mongoUrl)
      db.on('error', e => {
        console.log(`ERR modl.connect ${name} ${mongoUrl}:`.red, e)
        if (cb) cb()
      })
      db.once('open', ok)
      return db
    }
  }

  model.importSchemas = (dir, opts) => {
    opts = opts || {}
    var excludes = opts.excludes || []
    var da = DA[opts.daType||'Mongoose']
    var db = opts.mongoUrl ? model.connect(opts, opts.open) : null
    var enumFile = opts.enums !== false ? path.join(dir,'_enum') : false

    if (enumFile) {
      try {
        Object.assign(model.Enum, require(enumFile))
      } catch (e) {
        console.log(`Model.Enum import failed from ${enumFile}`.magenta)
      }
    }
    
    var map = opts.collections
    var schemaNames = fs.readdirSync(dir)
        .filter(f=>/\.js$/.test(f) && f.indexOf('_') !=0)            // .js files
        .map(f=>f.replace(/\.js$/,''))
        .filter(f=>map?map[f]:true)           // exclude files starting with _
        .filter(f=>excludes.indexOf(f)==-1)   // exclude explicit mentions in config
        // .map(f=>)

    for (var name of schemaNames) {
      var modelName = `${Util.toCamelCase(map?map[name]:name)}`
      model.DAL[modelName] = new da(name, dir, {db,modelName})
    }

    LOG('modl.init', 'IMPORTED schemas', schemaNames, dir)
    if (excludes.length) LOG('modl.init', 'EXCLUDED schemas', excludes)
  }

  //-- importSchemas is called on initialization and can also
  //-- be subsequently invoked with additional directories to extend the model
  config.model.dirs.map(dir => model.importSchemas(dir))

  return model
}

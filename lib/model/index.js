module.exports = function(config, done) {

  let cfg                    = honey.cfg('model')
  let opened                 = {}

  var model                  = { Enum: require('./enum'), DAL: {} }

  // var DA                  = honey.fs.requireDir(join(__dirname,'da'))
  var DA                     = {}
  cfg.da.forEach(n => DA[n]  = honey.fs.require(join(__dirname,'da'), n))

  let Types                  = require('./types')
  const mongoose             = require('mongoose')
  const {connection}         = mongoose
  const mongoOps             = { useUnifiedTopology: true, 
                                 useNewUrlParser: true,
                                 useCreateIndex: true }

  if (cfg.cache)
    model.cache = require('./cache')
  // if (cfg.session)
    model.sessionStore = require('./session')(connection)

  model.connect = function(_config, cb) {
    if (!cb && _config.constructor == Function) {
      cb = _config
      _config = Object.assign({name:'domain'}, config.model.domain)
    }

    let {mongoUrl,name} = _config

    if (opened[mongoUrl]) {
      LOG('modl.connect', `REUSING (${name})`, mongoUrl)
      return cb ? cb() : null
    }

    let ok = () => {
      LOG('modl.connect', `CONNECTED (${name}) `, mongoUrl)
      if (cb) return cb()
    }


    opened[mongoUrl] = new Date()

    if (name == 'domain') {
      mongoose.connect(mongoUrl, mongoOps)
      connection.on('error', e => {
        $log(`ERR modl.connect ${name} ${mongoUrl}:`.red, e)
        if (done) done()
      })
      connection.once('open', ok)
    }
    else {
      return mongoose.createConnection(mongoUrl, mongoOps)
        .on('error', e => {
          $log(`ERR modl.connect ${name} ${mongoUrl}:`.red, e)
          if (cb) cb()
        })
        .once('open', ok)
    }
  }

  model.importSchemas = (dir, opts={}) => {
    let {excludes} = opts
    let daType = (opts.daType||'mongoose').toLowerCase()
    let js = honey.fs.childJs(dir)
    let schemaTypes = Types

    let enums = js.indexOf('_enum') == -1
      ? false : honey.fs.require(dir, '_enum')
    assign(model.Enum, enums||{})

    if (js.indexOf('_types') > -1)
      Types = function() {
        return assign(schemaTypes.apply(this, arguments),
             require(dir+'/_types').apply(this,arguments))
             // honey.fs.require(dir, '_types', arguments))
      }

    let da = DA[daType](mongoose, model.Enum, Types)

    let map = opts.collections
    let schemaNames = js
      .filter(f => f.indexOf('_') != 0)
      .filter(f => map ? map[f] : true)
      .filter(f => (excludes||[]).indexOf(f) == -1) // explicit excludes from config

    function importEm() {
      for (let name of schemaNames) {
        let modelName = `${honey.util.String.camel(map?map[name]:name)}`
        if (model.DAL[modelName])
          LOG('modl.init', 'SKIPPED existing schema', modelName)
        else
          model.DAL[modelName] = new da(name, dir, {db,modelName})
      }

      LOG('modl.init', `IMPORTED schemas${enums?' + enums':''}`, schemaNames, dir)
      if (excludes) LOG('modl.init', 'EXCLUDED schemas', excludes)

      if (opts.open) opts.open()
    }

    var db = opts.mongoUrl ? model.connect(opts, mongoOps, importEm) : importEm()
  }

  //-- importSchemas is called on initialization and can also
  //-- be subsequently invoked with additional directories to extend the model
  config.model.dirs.map(dir => model.importSchemas(dir))

  return model
}

'use strict';

// A mongoose wrapper for our consistent Data Access Interface

var Util                       = require('./util')
var Path                       = require('path')
var Schemafy, Query, ToId, ToIds, NewId;
var schemaOpts = { required:true,trim:true,lowercase:true,unique:true,sparse:true }


// DA == "Data Accessor"
class MongoseDA {

  //--------------------------------------
  //-- Interface functions for data access

  getById(id, opts, cb) { this._find(false, Query.byId(id), opts, cb) }
  getByQuery(query, opts, cb) { this._find(false, query, opts, cb) }

  getAll(opts, cb) { this._find(true,{},opts,cb) }
  getManyByQuery(query, opts, cb) { this._find(true, query, opts, cb) }
  getManyById(ids, opts, cb) { this._find(true, {_id:{$in:ids}}, opts, cb) }

  searchByRegex(term, matchOn, opts, cb) { this._findManyByRegex(term, matchOn, opts, cb) }
  aggregate(chain, cb) { this._aggregate(chain, cb) }

  updateUnset(id, names, opts, cb) { this._updateOne(false, id, Util.arrayAsObj(names,f=>1), opts, cb) }
  updateSet(id, fields, opts, cb) { this._updateOne(true, id, fields, opts, cb) }
  updateSetBulk(updates, opts, cb) { this._updateBulk(updates, opts, cb) }

  create(o, cb) { this._create(o,cb) }
  delete(o, cb) { this._delete(o,cb) }

  bulkOperation(inserts, updates, deletes, cb) { this._bulk(inserts, updates, deletes, cb) }

  //--------------------------------------
  //--------------------------------------

  constructor(modelName, dir, daOpts) {

    var model = Schemafy(modelName, dir || config.appModelDir, daOpts)
    var collection = model.collection

    this.newId = NewId
    this.toId = ToId

    this._find = function(many, conditions, opts, cb) {

      if (!cb && opts.constructor === Function) {
        cb = opts
        opts = null
      }
      opts = opts || {}

      var join = opts.join,
          sort = opts.sort,
          select = opts.select,  // Expecting space separated attrs
          limit = opts.limit;

      var options = { lean: true }
      if (many) {
        if (sort) Object.assign(options,{sort})
        if (limit) Object.assign(options,{limit})
      }

      var op = many?'find':'findOne'
      LOG('modl.read', `${modelName}.${op}`, JSON.stringify(conditions).gray, select||'*', options)

      var q = model[op](conditions, select, options)

      for (var p in join||{})
        q = q.populate(p,join[p])

      q.exec( (e, r) => {
        if (e) $log(`${modelName}.${op}.err`, conditions, e, cb)
        r = (join && r) ? Util.renameJoinAttrs(r, join) : r
        cb(e, r)
      } )
    }

    this._findManyByRegex = (term, matchFields, opts, cb) => {
      function tokenize(term, wildcardStart, wildcardEnd) {
        if (!term) return '.*';
        var regex = '';
        if (wildcardStart) regex += '.*';
        var tokens = term.split(' ');
        regex += tokens ? tokens.join('.*') : term
        if (wildcardEnd) regex += '.*';
        return regex
      }
      var encodedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}+]/g, '\\$&')
      var regex = new RegExp(tokenize(encodedTerm, true, true), 'i');
      var query = Object.assign({ '$or': [] }, opts.andQuery || {} )
      for (var f of matchFields.split(' ')) {
        var match = {}
        match[f] = regex
        query['$or'].push(match)
      }
      this._find(true, query, opts, cb)
    }

    this._aggregate = function(chain, cb) {
      model.aggregate(chain, cb)
    }

    this._updateOne = function(set, _id, fields, opts, cb) {
      if (!cb && (opts||{}).constructor == Function) {
        cb = opts
        opts = {}
      }
      opts = Object.assign(opts||{},{new:true})

      if (!_id) return cb(Error(`Cannot update object by null id`))
      var update = set ? { $set: fields } : { $unset: fields }

      LOG('modl.write',`${modelName}.updateOne[${_id}]`, Query.byId(_id), update, opts)

      if (set)
        model.findOneAndUpdate(Query.byId(_id), update, opts, (e,r) => {
          if (e || !r) $log(`${modelName}.updateOne.error`.red, _id, `${(e||{}).message}`.red, JSON.stringify(update||{}).yellow)
          if (r) r = r.toObject()
          if (cb) cb(e, r)
        })
      else
        collection.findAndModify(Query.byId(_id), [['_id',1]], update, opts, (e,r) => {
          if (e || !r) $log(`${modelName}.updateOne.error`.red, _id, `${(e||{}).message}`.red, JSON.stringify(update||{}).yellow)
          if (cb) cb(e, r.value)
        })
    }

    this._updateBulk = function(updates, opts, cb) {
      if (!cb && (opts||{}).constructor == Function) {
        cb = opts
        opts = {}
      }
      if (!opts.ordered) opts.ordered = false

      var bulkOps = []
      for (var u of updates) bulkOps.push({ updateOne: { q:{_id:u._id}, u: { $set: u } } })
      model.collection.bulkWrite(bulkOps, opts, cb)
    }

    this._create = function(o, cb) {
      LOG('modl.write', `${modelName}.create`, o)
       new model( o ).save( (e,r) => {
        if (e) $log(`modl.${modelName}.create.error`.red, `${(e||{}).message}`.red, JSON.stringify(o||{}).yellow)
        if (r) r = r.toObject()
        if (cb) cb(e, r)
      })
    }

    this._delete = function({_id}, cb) {
      if (!_id) return cb(Error(`Cannot delete object by null id`))
      LOG('modl.write',`${modelName}.delete`, _id)
      model.findByIdAndRemove(_id, (e) => {
        if (e) $log(`${modelName}.delete.error`, _id, `${(e||{}).message}`.red)
        if (cb) cb(e)
      })
    }

    this._bulk = function(inserts, updates, deletes, cb) {
      var bulkOps = []
      for (var i of (inserts||[])) bulkOps.push({ insertOne: i })
      for (var u of (updates||[])) bulkOps.push({ updateOne: { q:{_id:u._id}, u: { $set: u } } })
      for (var d of (deletes||[])) bulkOps.push({ deleteOne: d })
      LOG('modl.write',`${modelName}.bulk`, i, u, d)
      model.collection.bulkWrite(bulkOps, {ordered:true}, cb)
    }

  }

}



module.exports = function(mongoose, Enum) {

  mongoose.Promise = global.Promise;

  schemaOpts.asSchema = (obj) => new mongoose.Schema(obj,
    {_id:true,versionKey:false,strict:true})

  Schemafy = (schemaName, dir, opts) => {
    // $log('Schemafy', schemaName, dir, opts)
    var name = opts.modelName || schemaName
    if (mongoose.models[name]) {
      LOG('app.verbose', `DAL.${name.magenta}`.yellow, `daMongoose.Schemafy called with existing name ${name.white}`.yellow)
      return mongoose.model(name)
    }
    else {
      var {ObjectId} = mongoose.Schema.Types
      var types = require('./types')(ObjectId, Enum, schemaOpts)
      var schemaFile = Path.join(dir, schemaName.toLowerCase())
      var modelSchema = require(schemaFile)(types, schemaOpts)
      return mongoose.model(name, modelSchema)
    }
  }

  NewId = () => new mongoose.Types.ObjectId()
  ToId = id => mongoose.Types.ObjectId(id.toString())
  ToIds = ids => ids.map(id=>ToId(id))
  Query = {
    byId: function(id) {
      var idified = {}
      if (id && id.constructor === Object) {
        for (var key in id)
          idified[key] = ToId(id[key])
      } else {
        idified = {_id:ToId(id)}
      }
      return idified
    }
  }

  return MongoseDA
}


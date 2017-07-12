'use strict';

// A mongo collection wrapper for our consistent Data Access Layer

var Util                       = require('./util')
var Path                       = require('path')
var Schemafy, Query, ToId, ToIds, NewId;
var schemaOpts = { required:true,trim:true,lowercase:true,unique:true,sparse:true }


// DA == "Data Accessor"
class MongoDA {

  //--------------------------------------
  //-- Interface functions for data access

  getById(id, opts, cb) { this._find(false, Query.byId(id), opts, cb) }
  getByQuery(query, opts, cb) { this._find(false, query, opts, cb) }

  getAll(opts, cb) { this._find(true,{},opts,cb) }
  getManyByQuery(query, opts, cb) { this._find(true, query, opts, cb) }
  getManyById(ids, opts, cb) { this._find(true, {_id:{$in:ids}}, opts, cb) }

  searchByRegex(term, matchOn, opts, cb) { this._findManyByRegex(term, matchOn, opts, cb) }
  aggregate(chain, cb) { this._aggregate(chain, cb) }

  updateUnset(id, names, cb) { this._updateOne(false, id, Util.arrayAsObj(names,f=>1), cb) }
  updateSet(id, fields, cb) { this._updateOne(true, id, fields, cb) }
  updateSetBulk(updates, cb) { this._updateBulk(updates, cb) }
  // updateSetMany(query, fields, cb) { this._updateOne(true, id, fields, cb) } ??

  create(o, cb) { this._create(o,cb) }
  delete(o, cb) { this._delete(o,cb) }

  bulkOperation(inserts, updates, deletes, cb) { this._bulk(inserts, updates, deletes, cb) }

  //--------------------------------------
  //--------------------------------------

  constructor(schemaName, dir, daOpts) {

    this.newId = NewId
    this.ToId = ToId
    var modelName = daOpts.modelName||schemaName
    var collection = Schemafy(schemaName, dir, daOpts)

    this._find = function(many, conditions, opts, cb) {

      if (!cb && opts.constructor === Function) {
        cb = opts
        opts = null
      }
      opts = opts || {}

      var join = opts.join,
          sort = opts.sort,
          limit = opts.limit;

      var select = null
      if (opts.select) {
        select = {}
        for (var attr of opts.select.split(' ')) // Expecting space separated attrs
          select[attr] = 1
      }

      if (join) throw Error(`MongoDA does not yet support join option`)

      var options = { lean: true }
      if (many) {
        if (sort) assign(options,{sort})
        if (limit) assign(options,{limit})
        LOG('modl.read', `${modelName}.find`, JSON.stringify(conditions).gray, select||'*', options)
        collection.find(conditions, select, options).toArray((e, r) => {
          if (e) $log(`${modelName}.find.err`, conditions, e, cb)
          // r = (join && r) ? Util.renameJoinAttrs(r, join) : r
          cb(e, r)
        })
      }
      else {
        throw Error(`MongoDA does not yet support findOne`)
      }
      // for (var p in join||{})
        // q = q.populate(p,join[p])
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
      collection.aggregate(chain, cb)
    }

    this._updateOne = function(set, _id, fields, cb) {
      if (!_id) return cb(Error(`Cannot update object by null id`))
      var update = set ? { $set: fields } : { $unset: fields }

      LOG('modl.write',`${modelName}.updateOne[${_id}]`, Query.byId(_id), update)

      if (set)
        throw Error("MongoDA.updateSet coming soon")
      else
        collection.findAndModify(Query.byId(_id), [['_id',1]], update, {new:true}, (e,r) => {
          if (e || !r) $log(`${modelName}.updateOne.error`.red, _id, e, update)
          if (cb) cb(e, r.value)
        })
    }

    this._updateBulk = function(updates, cb) {
      LOG('modl.write', `${modelName}._updateBulk`, updates.length)
      var bulkOps = []
      for (var u of updates)
        bulkOps.push({ updateOne: { q:{_id:u._id}, u: { $set: u } } })
      collection.bulkWrite(bulkOps, {ordered:true}, cb)
    }

    this._create = function(o, cb) {
      LOG('modl.write', `${modelName}.create`, o)
      collection.insertOne(o, (e,r) => {
        if (e) $log(`modl.${modelName}.create.error`.red, e.message.white, JSON.stringify(o).gray)
        if (r) r = r.ops[0]
        if (cb) cb(e, r)
      })
    }

    this._delete = function({_id}, cb) {
      if (!_id) return cb(assign(Error(`Cannot delete object by null id`),{status:403}))
      LOG('modl.write',`${modelName}.delete`, _id)
      throw Error("MongoDA.delete coming soon")
    }

    this._bulk = function(inserts, updates, deletes, cb) {
      var bulkOps = []
      for (var i of (inserts||[])) bulkOps.push({ insertOne: i })
      for (var u of (updates||[])) bulkOps.push({ updateOne: { q:{_id:u._id}, u: { $set: u } } })
      for (var d of (deletes||[])) bulkOps.push({ deleteOne: d })
      LOG('modl.write',`${modelName}.bulk`, i, u, d)
      collection.bulkWrite(bulkOps, {ordered:true}, cb)
    }

  }

}



module.exports = function(mongoose, Enum) {

  Schemafy = (schemaName, dir, opts) => {
    opts = opts || {}
    var name = opts.modelName||schemaName
    var db = opts.db || mongoose
    if (db.models[name])
      return db.model(name).collection
    else {
      var {ObjectId} = mongoose.Schema.Types
      var asSchema = def => new mongoose.Schema(def, {_id:true,versionKey:false,strict:true})
      var types = require('./types')(ObjectId, Enum, schemaOpts)
      var schemaFile = Path.join(dir, schemaName.toLowerCase())
      var modelSchema = require(schemaFile)(types, Object.assign({asSchema},schemaOpts))
      return db.model(name, modelSchema).collection
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

  return MongoDA
}


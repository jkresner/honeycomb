'use strict';

var Doc = (DAL, {app, map, toUserId, formatter, noop}) =>
  function(type, ctx, d, cb) {
    d.app = app
    d.ip = ctx.ip
    d.sId = ctx.sId // sessionID
    if (ctx.user) d.uId = toUserId(ctx.user._id)
    if (ctx.ua) d.ua = ctx.ua
    if (ctx.utm) d.utm = ctx.utm
    if (ctx.ref) d.ref = ctx.ref
    if (d.ctx) {
      if (d.ctx.hasOwnProperty('prefix')) d.ctx.prefix = colors.strip(d.ctx.prefix)
      if (d.ctx.hasOwnProperty('user') &&
          (d.ctx.user == null || d.ctx.user == 'unset')) delete d.ctx.user
      if (d.ua && d.data.ua) delete d.data.ua
      if (d.ua && d.ctx.ua) d.ctx = _.omit(d.ctx,'ua')
      if (d.sId && d.ctx.sId) d.ctx = _.omit(d.ctx,'sId')
    }
    DAL[map[type]].create(d, noop)
    formatter(type, d, ctx)
    cb = cb||noop
    cb(null, d) // unblocked
  }


var aliasDocs = (DA, sId, uId, cb) =>
  !DA ? 0 : DA.getManyByQuery({sId,uId:{$exists:0}}, {select:'_id'}, (e, updates) =>
    DA.updateSetBulk(updates.map(up => assign(up,{uId}), cb)))


class Analytics {

  constructor(cfg, model, opts) {
    var {DAL} = model
    opts = opts || {}
    opts.noop = opts.noop || (e=>{})
    opts.toUserId = opts.toUserId || (id => DAL.User.toId(id))
    opts.app = cfg.appKey
    opts.map = cfg.model.collections

    var createDoc = Doc(DAL, opts)
    var {event,impression,issue,view,campaign} = cfg.model.collections

    var track = opts.track || {}
    this.track = track  // hmmmmmm a bit messy

    var project = (name, data) => {
      var key = name.split(':')[0]
      return assign({name},{data:track[key]?track[key](data):data})
    }

    var Ctx = (ctx) => ctx.ctx || ctx // can be lazy / pass req or this


    if (event) this.event = function(ctx, name, data, cb) {
      var alias = ctx.analytics.alias
      var ctx = Ctx(ctx)

      if (alias) {
        ctx.user = alias
        var uId = opts.toUserId(ctx.user._id)
        aliasDocs(DAL[view], ctx.sId, uId, opts.noop)
        aliasDocs(DAL[issue], ctx.sId, uId, opts.noop)
        aliasDocs(DAL[impression], ctx.sId, uId, opts.noop)
      }

      createDoc('event', ctx, project(name, data), cb)
    }

    if (impression) this.impression = function(ctx, ad, cb) {
      createDoc('impression', Ctx(ctx), {img:ad.img,_id:ad._id}, cb)
    }

    if (issue) this.issue = function(ctx, name, type, data, cb) {
      createDoc('issue', Ctx(ctx), {name,type,data,ctx}, cb)
    }

    if (view) this.view = function(ctx, type, obj, cb) {
      createDoc('view', Ctx(ctx), { oId: obj._id, url: obj.url, type }, cb)
    }
  }

}


module.exports = (config, DAL, opts) => new Analytics(config, DAL, opts)

function hashById(list)
{
  var hash = []
  for (var o of list) hash[o._id] = o
  return hash
}


var cache = {}


cache.flush = function(pattern) {

  for (var key in cache) {
    //-- E.g flush 'posts' might flush more than one item e.g. 'posts' && 'postsPublished'
    if (key.match(pattern)) {
      delete cache[key]
      LOG('modl.cache', `cache:flush ${key}`)
    }
  }
}


cache.collectionReady = function(name, getForCacheFn, hashFn, cb)
{
  if (cache[name] != null) return cb()

  if (!cb && hashFn.constructor === Function) {
    cb = hashFn
    hashFn = hashById
  }
  getForCacheFn( (e, list) => {
    LOG('modl.cache', `CACHE[${name}] ready`)
    cache[name] = (hashFn||hashById)(list)
    cb()
  })
}


cache.get = function(key, getForCacheFn, cb) {
  if (cache[key]) return cb(null, cache[key])
  getForCacheFn( (e,r) => {
    if (e) return cb(e)
    cache[key] = r
    var items = !r ? 0 : r.length||Object.keys(r).length
    LOG('modl.cache', `CACHED set[${items}]`, key)
    cb(null, r)
  })
}


cache.inflate = function(key, attrs) {
  if (!cache[key]) throw Error(`cache.inflate fail. cache[${key}] undefined`)
  LOG('modl.init', `cache.inflate[${key}] =>`, attrs)
  attrs = attrs.split(' ')
  return raw => {
    if (raw[key]) {
      for (var o of raw[key]) {
        var cached = cache[key][o._id]||{}
        assign(o, _.pick(cached, attrs))
      }
    }
    return raw
  }
}


cache.require = function(getters, cb) {
  var prom = (key, getter) => new Promise(function(resolve, reject) {
    // $log('cache.require.one'.yellow, key, getter)
    getter((e, r, length) => {
      if (e) return reject(e)
      cache[key] = r
      // $log(`cache.require.getter[${key}].cb`.yellow, e, r, length)
      var count = (r||{length}).length || Object.keys(r).length
      LOG('modl.cache', `CACHE require[${count}]`, key)
      // $log('cache.require.getter.cb'.yellow, count)
      resolve(key)
    })
  })

  Promise.all(Object.keys(getters).map(key => prom(key, getters[key]))).then(
    keys => cb(null),
    cb
  )
}


cache.prime = function(cfg, {logic, model,projector}, cb) {
  global.CAL = cache
  let getters = {},
      inflates = (cfg.inflate||{})
      requires = (cfg.require||'')
        .split(',')
        .map(i=>i.split(':'))
        .map( ([ns,fn]) => ({
            ns, fn, key:`${ns}_${fn}`,
                    getr: logic[ns][fn||'hash'].exec }))
        // .map(r=>log('require:',r.ns,r.fn,'key:r.key','fn'.blue, getr)||r)

  requires.forEach( r => getters[r.key] = r.getr)

  cache.require(getters, e => {
    if (e) return cb(e, $log('cache.require.err'.red, e))
    TIME(`CACHED  requires`)
    for (let key in inflates)
      projector._.inflate[key] = cache.inflate(key, inflates[key])
    cb()
  })
}


module.exports = cache

const Web     = require(join(process.cwd(),'/lib/app/init'))
const Worker  = require(join(process.cwd(),'/lib/app/init.worker'))
const Auth    = require(join(process.cwd(),'/lib/auth/index'))

const model   = {
  cache: { prime: (c,h,cb) => { cb() } },
  importSchemas: (dir, opts) => { opts.open() }
}

const cfg     = {
  log: { 
    appKey: 'tst', 
    it: {}, 
    analytics: { ga: {}, model: { collections: {issues:'Issue'} } } 
  },
  http: { ctx: {}, static: { dirs: [] } },
  middleware: { dirs: [] },
  model: {},
  routes: {}
}


function web() {

  IT('wire.chain.run', function() {
    Web(cfg, (e) => DONE(e))
      .honey
        .wire({model})
        .chain(cfg.middleware, cfg.routes)
        .run()
  })

  IT('wire.merge.chain.run', function() {
    Web(cfg, (e) => DONE(e))
      .honey
        .wire({model})
        .merge(Auth)        
        .chain(cfg.middleware, cfg.routes)
        .run()
  })

  IT('wire.inflate[empty].chain.run', function() {
    Web(cfg, (e) => DONE(e))
      .honey
        .wire({model})
        .inflate()        
        .chain(cfg.middleware, cfg.routes)
        .run()
  })

  IT('wire.inflate[cfg].chain.run', function() {
    Web(cfg, (e) => DONE(e))
      .honey
        .wire({model})
        .inflate({it:5})        
        .chain(cfg.middleware, cfg.routes)
        .run()
  })

  IT('wire.merge.track.inflate[cfg].chain.run', function() {    
    cfg.model.cache = {}
    Web(cfg, (e) => DONE(e))
      .honey
        .wire({model})
        .merge(Auth) 
        .track({track:{}})        
        .inflate({it:6})        
        .chain(cfg.middleware, cfg.routes)
        .run()
  })
}


function worker() {
  IT('wire.merge.track.inflate[cfg].run', function() {    
    cfg.model.cache = {}
    Worker(cfg, (e) => DONE(e))
      .honey
        .wire({model})
        .merge(Auth) 
        .track({track:{}})        
        .inflate({it:6})        
        .run()
  })
}



module.exports = () => {

  before(() => {
    STUB.globals({config:{},honey:{}}) 
  })

  after((done) => {
    STUB.restore.globals()
    done()
  })     

  // DESCRIBE("static", static)
  DESCRIBE("worker", worker)
  DESCRIBE("web", web)

}

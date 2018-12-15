const noop  = ()=>{}
let lib     = path => require(join(process.cwd(),'lib',path))
let express = require('express')
let port    = 1201
let Router  = lib('/app/router')
let Api     = lib('/app/api')
let $mw     = { trace:noop,name:noop,done:noop }
let $req    = { STOP: true }
let DAL     = { User: { getByQuery(q, opts, cb) { cb(null, { name: 'stub' }) } } }
let deps    = { DAL, $mw, $req }
let mw      = {
  data: lib('middleware/data')(deps),
  res:  lib('middleware/res')(deps),
  $: {
    fakeUser: (req, res, next) => next(null, assign(req,{user:{name:'fake'}})),
    wrap: (req, res, next) => next()
  }
}

module.exports = () => {

  before(function() {
    STUB.globals({APP:null,LOG:noop,_:require('lodash'), honey:{
      cfg: x => {},
      logic: {
        users: {
          me:  { chain: function(cb) { cb(null, this.user) } },
          findUser: { chain: (user, cb) => cb(null, user) },
          getUser: { chain: (_id, cb) => cb(null, { _id, name: 'first last'}) },
          listUser: { chain: (cb) => cb(null, [{ name: 'first'},{name:'second'}]) }
        }
      }
    }})
  })

  after(function() { STUB.restore.globals() })

  beforeEach(function() {
    global.APP = assign(express(),{honey:{middleware:mw}})
    honey.Router = Router(APP, express)
    APP.API = Api(APP, mw, {baseUrl:'/api'})

    APP.run = cb => {
      for (var name in APP.routers) APP.routers[name].mount()
      APP.use((e, req, res, next) => { throw(e) })
         .listen(++port, cb).on('error', cb)
    }

  })


  IT('Serve logic.users opts = rest:true', function() {

    APP.API('users', {rest:true})
      .get({ getUser: 'params.id' })
      .get({ listUser: '' })

    APP.run(e =>
      GET('/users/id1', r1 =>
        GET('/users/id2', r2 =>
          GET('/users', r3 => {
            expect(e).to.be.undefined
            expect(r1._id).to.equal('id1')
            expect(r2._id).to.equal('id2')
            expect(r1.name).to.equal('first last')
            expect(r2.name).to.equal('first last')
            expect(r3.length).to.equal(2)
            DONE()
          }))))

  })

  IT('API logic has request ctx (req.user)', function() {
    APP.API('users', {rest:true})
      .get({ use: 'fakeUser' },
           { me: ''             })

    APP.run(e => GET('/users/me', r1 => {
      expect(e).to.be.undefined
      expect(r1._id).to.be.undefined
      expect(r1.name).to.equal('fake')
      DONE()
    }))
  })

  IT('api.params()', function() {

    APP.API('users', {rest:true})
      .params('user')
      .get({ findUser: 'user'   })

    APP.run(e => GET('/users/find/id4', r2 => {
      expect(e).to.be.undefined
      expect(r2._id).to.be.undefined
      expect(r2.name).to.equal('stub')
      DONE()
    }))

  })


}

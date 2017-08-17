const noop  = ()=>{}
let suspend = { APP: null, LOG: null, honey: null, _: null }
let express = require('express')
let port    = 1201
let Router  = require(join(process.cwd(),'/lib/app/router'))
let Api     = require(join(process.cwd(),'/lib/app/api'))
let $mw     = { trace:noop,name:noop,done:noop }
let $req    = { STOP: true }
let DAL     = { User: { getByQuery(q, opts, cb) { cb(null, { name: 'stub' }) } } }
let deps    = { DAL, $mw, $req}
let MW      = {
  data: require(join(process.cwd(),'/lib/middleware/data'))(deps),
  res: require(join(process.cwd(),'/lib/middleware/res'))(deps)
}
let mw      = {
  data: { api: MW.data.api, param: MW.data.param },
  $: {
    apiJson: MW.res.api({formatter:(()=>{})}),
    fakeUser: (req, res, next) => next(null, assign(req,{user:{name:'fake'}}))
  }
  // session: (req, res, next) => next()
}
let logic   = {
  users: {
    me:  { chain: function(cb) { cb(null, this.user) } },
    findUser: { chain: (user, cb) => cb(null, user) },
    getUser: { chain: (_id, cb) => cb(null, { _id, name: 'first last'}) },
    listUser: { chain: (cb) => cb(null, [{ name: 'first'},{name:'second'}]) }
  }
}

module.exports = () => {

  before(function() {
    Object.keys(suspend).forEach(key => suspend[key] = global[key])
    global.LOG = () => {}
    global._ = require('lodash')
  })

  after(() =>
    Object.keys(suspend).forEach(key => global[key] = suspend[key]))

  beforeEach(function() {
    global.honey = { cfg: x => ({baseUrl:'/api'}), logic }
    global.APP = express()
    honey.Router = Router(APP, express)
    APP.API = Api(APP, mw)

    APP.run = cb => {
      for (var name in APP.routers) APP.routers[name].mount()
      APP
      // .use((res, req, next) => next(null, console.log('not found')))
         .use((e, req, res, next) => { throw(e) })
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

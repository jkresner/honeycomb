let suspend = { APP: null, LOG: null, honey: null }
let express = require('express')
let Router  = require(join(process.cwd(),'/lib/app/router'))

var mwN = n => function(req,res,next) {
  // console.log('mw'+n)
  req.locals.order = req.locals.order || []
  req.locals.order.push('mw'+n)
  next(null, req.locals['mw'+n] = true)
}
let mw = { $1: mwN('1'), $2: mwN('2'), $3: mwN('3'), $4: mwN('4'),
           $5: mwN('5'), $6: mwN('6'), $7: mwN('7'), $8: mwN('8') }


module.exports = () => {

  before(function() {
    Object.keys(suspend).forEach(key => suspend[key] = global[key])
    global.LOG = () => {}
  })

  after(() =>
    Object.keys(suspend).forEach(key => global[key] = suspend[key]))

  beforeEach(function() {
    global.APP = express()
      .use((req,res,next) => next(null, req.locals = {}))

    APP.ready = cb =>
      APP.use((res, req, next) => next(null, console.log('not found')))
         .use((e, req, res, next) => { throw(e) })
         .listen(1101, cb).on('error', cb)

    global.honey = { cfg: x => {} }
    honey.Router = Router(APP, express)
  })


  IT('Middleware silos in individual routers', function() {

    honey.Router('r0')
      .get('/', (req, res, next) => { res.send('home') })
      .get('/about', (req, res, next) => { res.send('about') })
    .mount()

    honey.Router('/r1')
      .use(mw.$1)
      .use(mw.$3)
      .get('/r1', function(req, res) {
        expect(req.locals.mw1).to.equal(true)
        expect(req.locals.mw2).to.be.undefined
        expect(req.locals.mw3).to.equal(true)
        expect(req.locals.order[0]).to.equal('mw1')
        expect(req.locals.order[1]).to.equal('mw3')
        res.send('ok1') })
    .mount()

    honey.Router('m2')
      .use(mw.$2)
      .get('/r2', (req, res) => {
        expect(req.locals.mw1).to.be.undefined
        expect(req.locals.mw2).to.equal(true)
        expect(req.locals.mw3).to.be.undefined
        res.send('ok2') })
    .mount()

    APP.ready(e =>
      PAGE('/r1', {}, text1 =>
        PAGE('/r2', {}, text2 => {
          expect(e).to.be.undefined
          expect(text1).to.equal('ok1')
          expect(text2).to.equal('ok2')
          DONE()
        })))

  })


  IT('Middleware orders correctly opts.mount urls', function() {

    honey.Router('r4',{mount:'/tst'})
      .use(mw.$4)
      .use(mw.$5)
      .get('/singles', function(req, res) {
        expect(req.locals.mw4).to.equal(true)
        expect(req.locals.mw6).to.be.undefined
        expect(req.locals.mw5).to.equal(true)
        expect(req.locals.order.length).to.equal(2)
        expect(req.locals.order[0]).to.equal('mw4')
        expect(req.locals.order[1]).to.equal('mw5')
        res.send('ok1') })
    .mount()

    honey.Router('r5')
      .use([mw.$6, mw.$7, mw.$8])
      .get('/tst/arrays', (req, res) => {
        expect(req.locals.mw4).to.be.undefined
        expect(req.locals.mw5).to.be.undefined
        expect(req.locals.mw6).to.equal(true)
        expect(req.locals.mw7).to.equal(true)
        expect(req.locals.order.length).to.equal(3)
        expect(req.locals.order[0]).to.equal('mw6')
        expect(req.locals.order[1]).to.equal('mw7')
        expect(req.locals.order[2]).to.equal('mw8')
        res.send('ok2') })
    .mount()

    APP.ready(e =>
      PAGE('/tst/singles', {}, (content1) =>
        PAGE('/tst/arrays', {}, (conten2) => {
          expect(content1).to.equal('ok1')
          expect(conten2).to.equal('ok2')
          DONE()
        })))

  })


}

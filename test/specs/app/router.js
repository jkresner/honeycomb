// var App = require('../../../app/init')
// var notFound = (res, req, next) => next(null, console.log('not found'.magenta))
// var cfg = {http:{port:10}, middleware: { dirs: ['mw'] }, routes: { dirs: ['sr'] }, templates:{dirs:{}}}
// var mwN = n => function(req,res,next) {
//     // console.log('mw'+n);`
//   req.locals.order = req.locals.order || []
//   req.locals.order.push('mw'+n)
//   next(null, req.locals['mw'+n] = true)
// }


module.exports = () => {


//   beforeEach(function() {
//     global.assign = Object.assign
//     // global.LOG = function() {}
//     global.LOG = console.log
//   })


  it('Middleware not shared between routers') //, function() {
//     var count = 0
//     var plumber = {
//       $requireDir(dir, {dependencies}) {
//         var [app, MW, cfg] = dependencies
//         if (++count == 1) {
//           MW.cache('mw1', mwN(1))
//           MW.cache('mw2', mwN(2))
//           MW.cache('mw3', mwN(3))
//           MW.cache('session', (req, res, next) => next())
//           MW.cache('notFound', notFound)
//           MW.cache('error', (e, req, res, next) => { throw(e) })
//           return
//         }

//         app.use((req,res,next) => {
//           // console.log('global.use:', req.originalUrl)
//           req.locals = {}
//           global.COOKIE = 'spill'
//           next()
//         })

//         app.honey.Router('r0')
//           .get('/', (req, res, next) => { res.send('home') })
//           .get('/about', (req, res, next) => { res.send('about') })

//         app.honey.Router('/r1')
//           .use(MW.$['mw1']) //mw3'))
//          // .use(MW.$$('mw1 mw3'))
//           .use(MW.$['mw3'])
//           .get('/r1', function(req, res) {
//           // console.log('in /r1'.yellow, req.locals)
//             expect(req.locals.mw1).to.equal(true)
//             expect(req.locals.mw2).to.be.undefined
//             expect(req.locals.mw3).to.equal(true)
//             expect(req.locals.order[0]).to.equal('mw1')
//             expect(req.locals.order[1]).to.equal('mw3')
//             res.send('ok1') })

//         app.honey.Router('m2')
//           .use(MW.$.mw2)
//           .get('/r2', (req, res) => {
//             // console.log('in /r2'.yellow, req.locals)
//             expect(req.locals.mw1).to.be.undefined
//             expect(req.locals.mw2).to.equal(true)
//             expect(req.locals.mw3).to.be.undefined
//             res.send('ok2') })
//       }
//     }

//     global.APP = App.call({plumber}, cfg, e =>
//       PAGE('/r1', {}, (content1) => {
//         expect(content1).to.equal('ok1')
//         PAGE('/r2', {}, (conten2) => {
//           expect(conten2).to.equal('ok2')
//           DONE()
//         })
//       }))

//     APP.meanair.chain({},{}).run()
//   })


  it('Middleware executes in correct order') //, function() {
//     var count = 0
//     var plumber = {
//       $requireDir(dir, {dependencies}) {
//         var [app, MW, cfg] = dependencies
//         if (++count == 1) {
//           MW.cache('mw4', mwN(4))
//           MW.cache('mw5', mwN(5))
//           MW.cache('mw6', mwN(6))
//           MW.cache('mw7', mwN(7))
//           MW.cache('mw8', mwN(8))
//           MW.cache('session', (req, res, next) => next())
//           MW.cache('notFound', notFound)
//           MW.cache('error', (e, req, res, next) => { throw(e) })
//           return
//         }

//         app.use((req,res,next) => {
//           req.locals = {}
//           global.COOKIE = 'ordered'
//           next()
//         })

//         app.honey.Router('r4',{mount:'/tst'})
//           .use(MW.$['mw4'])
//           .use(MW.$['mw5'])
//           .get('/singles', function(req, res) {
//             expect(req.locals.mw4).to.equal(true)
//             expect(req.locals.mw6).to.be.undefined
//             expect(req.locals.mw5).to.equal(true)
//             expect(req.locals.order.length).to.equal(2)
//             expect(req.locals.order[0]).to.equal('mw4')
//             expect(req.locals.order[1]).to.equal('mw5')
//             res.send('ok1') })

//         app.honey.Router('r5')
//           .use([MW.$['mw6'],MW.$['mw7'],MW.$['mw8']])
//           .get('/tst/arrays', (req, res) => {
//             expect(req.locals.mw4).to.be.undefined
//             expect(req.locals.mw5).to.be.undefined
//             expect(req.locals.mw6).to.equal(true)
//             expect(req.locals.mw7).to.equal(true)
//             expect(req.locals.order.length).to.equal(3)
//             expect(req.locals.order[0]).to.equal('mw6')
//             expect(req.locals.order[1]).to.equal('mw7')
//             expect(req.locals.order[2]).to.equal('mw8')
//             res.send('ok2') })
//       }
//     }

//     global.APP = App.call({plumber}, cfg, e =>
//       PAGE('/tst/singles', {}, (content1) => {
//         expect(content1).to.equal('ok1')
//         PAGE('/tst/arrays', {}, (conten2) => {
//           expect(conten2).to.equal('ok2')
//           DONE()
//         })
//       }))

//     APP.meanair.chain({},{}).run()
//   })

}

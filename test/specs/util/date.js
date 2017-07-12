global.moment     = require('moment')
var Util          = require('../../../lib/util/date')
var MomentUtil    = Util.Moment


module.exports = () => DESCRIBE("Util", function() {


  IT('inRange', function() {
    var now = new Date()
    var future = moment('2030','YYYY')
    var start = moment('2010','YYYY')
    var end = moment('2020','YYYY')

    var rangeFn = Util.inRange(start, end)
    expect(rangeFn(now)).to.be.true
    expect(rangeFn(future)).to.be.false
    DONE()
  })


})

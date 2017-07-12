var Util = require('../../../lib/util/bsonid')


module.exports = () => DESCRIBE("Util", function() {


  IT('idsEqual', function() {
    expect(ObjectId).to.exist  // ObjectId is declared global inside SCREAM
    var oid = ObjectId("5609a8e59d438f11000e50f7")
    expect(oid.constructor!==String).to.be.true
    expect(oid.toString()).to.equal("5609a8e59d438f11000e50f7")
    expect(Util.equal(oid,"5609a8e59d438f11000e50f7")).to.be.true
    DONE()
  })


  IT('idToDate', function() {
    var oid = ObjectId("5609a8e59d438f11000e50f7")
    var oDate = Util.toDate(oid)
    expect(oDate.constructor).to.equal(Date)
    expect(oDate.getTime()).to.equal(1443473637000)
    DONE()
  })


  IT('idToMoment', function() {
    var oid = ObjectId("5609a8e59d438f11000e50f7")
    var oMoment = Util.toMoment(oid)
    expect(oMoment.utc().format("YY.MM.DD HH:MM")).to.equal("15.09.28 20:09")
    expect(Util.toMoment(oid, "YY.MM.DD HH:MM")).starts("15.09.")
    DONE()
  })


})
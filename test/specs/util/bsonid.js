let Util = require('../../../lib/util/bsonid')
let sort = (list, getter, order=-1) =>
  list.sort((a,b)=>order*Util.compare(_.get(a,getter),_.get(b,getter)))

module.exports = () => {


  IT('idsEqual', function() {
    expect(ObjectId).to.exist  // ObjectId is declared global inside SCREAM
    var oid = ObjectId("5609a8e59d438f11000e50f7")
    expect(oid.constructor!==String).to.be.true
    expect(oid.toString()).to.equal("5609a8e59d438f11000e50f7")
    expect(Util.equal(oid,"5609a8e59d438f11000e50f7")).to.be.true
    DONE()
  })


  IT('toDate', function() {
    var oid = ObjectId("5609a8e59d438f11000e50f7")
    var oDate = Util.toDate(oid)
    expect(oDate.constructor).to.equal(Date)
    expect(oDate.getTime()).to.equal(1443473637000)
    DONE()
  })


  IT('compare', function() {
    let id1 = ObjectId("5609a8e59d438f11000e50f7"),
        id2 = ObjectId("5609a8e59d438f11000e50f8"),
        id3 = ObjectId("5609a8e59d438f41000e50f7"),
        id4 = ObjectId("5609a8e79d438f11000e50f7")
    expect(Util.compare(id4,id3), "id4 > id3").to.equal(1)
    expect(Util.compare(id3,id2), "id3 > id2").to.equal(1)
    expect(Util.compare(id2,id1), "id2 > id1").to.equal(1)
    expect(Util.compare(id1,id2), "id1 > id2").to.equal(-1)
    expect(Util.compare(id1,id1), "id1 == id1").to.equal(0)
    DONE()
  })


  IT('idSort', function() {
    let chats = [
      { _id: ObjectId("598963d08240d6000422606d"),
        // oldest last message
        last: { _id: ObjectId("5989641f8240d60004226074"), text: 'Freakin awesome!!!' } },
      { _id: ObjectId("59a02fe2031b5f000442af7a"),
        last: { _id: ObjectId("59a926d6b5f10e0004b81fbc"), text: 'Hi I added 2 gyms from Dublin.' } },
      { _id: ObjectId("59a07c84031b5f000442afb2"),
        // newest last message
        last: { _id: ObjectId("59bbfe0e787caa000481cdec"), text: 'Thank you' } } ]

    let newest = sort(chats, 'last._id')
    expect(newest[0].last.text).inc('Thank you')
    expect(newest[1].last.text).inc('Hi I added')
    expect(newest[2].last.text).inc('Freakin')

    let oldest = sort(chats, 'last._id', 1)
    expect(oldest[0].last.text).inc('Freakin')
    expect(oldest[1].last.text).inc('Hi I added')
    expect(oldest[2].last.text).inc('Thank you')
    DONE()
  })


}

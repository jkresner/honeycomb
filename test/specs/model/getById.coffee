

basic = ->


  IT 'Gets one by _id as string', ->
    DAL.Tag.getById "5149dccb5fc6390200000013", (e, r) ->
      expect(r._id).bsonId()
      expect(r.name).to.equal("AngularJS")
      DONE()


  IT 'Gets one by _id as ObjectId', ->
    DAL.Tag.getById ObjectId("5149dccb5fc6390200000013"), (e, r) ->
      expect(r._id).bsonId()
      expect(r.name).to.equal("AngularJS")
      DONE()


  IT 'Gets one by _id as string and attr key specified', ->
    DAL.Tag.getById { _id: "5149dccb5fc6390200000013" }, (e, r) ->
      expect(r._id).bsonId()
      expect(r.name).to.equal("AngularJS")
      DONE()


  IT 'Gets one by _id as ObjectId and attr key specified', ->
    DAL.Tag.getById { _id: ObjectId("5149dccb5fc6390200000013") }, (e, r) ->
      expect(r._id).bsonId()
      expect(r.name).to.equal("AngularJS")
      DONE()



module.exports = ->

  before (done) =>
    DB.ensureDocs 'Tag', [FIXTURE.tags.angularjs], (r) => done()

  DESCRIBE("basic", basic)

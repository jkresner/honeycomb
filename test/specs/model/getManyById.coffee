

basic = ->

  IT 'Gets multiple by ids as string array', ->
    q = [
      "5149dccb5fc6390200000013",
      "5149dccb5fc6390200000022"
    ]
    Tag.getManyById q, (e, r) ->
      expect(r.length).to.equal(2)
      expect(r[0]._id).bsonId()
      expect(r[0].name).to.equal("AngularJS")
      DONE()


  IT 'Gets multiple by ids as ObjectId array', ->
    q = [
      ObjectId("5149dccb5fc6390200000013"),
      ObjectId("5149dccb5fc6390200000022")
    ]
    Tag.getManyById q, (e, r) ->
      expect(r.length).to.equal(2)
      expect(r[0].name).to.equal("AngularJS")
      expect(r[1]._id).bsonId()
      DONE()


module.exports = ->

  before (done) ->
    DB.ensureDoc 'Tag', FIXTURE.tags.rails, ->
      done()


  DESCRIBE("basic", basic)

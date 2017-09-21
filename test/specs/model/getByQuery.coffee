

basic = ->


  IT 'user by github id', ->
    DAL.Author.getByQuery { 'auth.gh.id': 11261012 }, null, (e, r) ->
      expect(r._id).eqId(FIXTURE.authors.tst1._id)
      DONE()


projections = ->


  IT 'selected attrs', ->
    DAL.Author.getByQuery { 'auth.gh.id': 11261012 }, { select: '_id name' }, (e, r) ->
      expect(Object.keys(r).length).to.equal(2)
      expect(r._id).bsonId()
      expect(r.name).to.exist
      DONE()



  IT 'join field', ->
    DAL.Author.getByQuery { 'auth.gh.id': 11261012 }, { join: { 'tagId': 'name' } }, (e, r) ->
      expect(r._id).bsonId()
      expect(r.tagId).to.be.undefined
      expect(r.tag).to.exist
      expect(r.tag._id).bsonId()
      expect(r.tag.name).to.equal("AngularJS")
      expect(r.tag.slug).to.be.undefined
      DONE()


  IT 'join fields (multiple)', ->
    DAL.Author.getByQuery { 'auth.gh.id': 11261012 }, { join: { 'tagId': 'name slug' } }, (e, r) ->
      expect(r._id).bsonId()
      expect(r.tagId).to.be.undefined
      expect(r.tag).to.exist
      expect(r.tag._id).bsonId()
      expect(r.tag.name).to.equal("AngularJS")
      expect(r.tag.slug).to.equal("angularjs")
      DONE()



module.exports = ->

  DESCRIBE("basic", basic)
  DESCRIBE("projects", projections)



queries = ->


  IT 'Gets all tags with no query ops', ->
    DAL.Tag.getManyByQuery {}, (e, r) ->
      expect(r.length>5).to.be.true
      DONE()


  IT 'Gets one by key as string value', ->
    DAL.Author.getManyByQuery {_id:'54551be15f221efa17111111'}, (e, r) ->
      expect(r.length).to.equal(1)
      DONE()


  IT 'Gets one by key as ObjectId', ->
    DAL.Author.getManyByQuery {_id:ObjectId('54551be15f221efa17111111')}, (e, r) ->
      expect(r.length).to.equal(1)
      DONE()


options = ->


  IT 'Gets only 2 tags with limit query ops', ->
    DAL.Tag.getManyByQuery {}, { limit: 2 }, (e, r) ->
      expect(r.length == 2).to.be.true
      DONE()


  IT 'join fields to each attr', ->
    DAL.Author.getManyByQuery {}, { join: { tagId: '_id name' } }, (e, r) ->
      expect(r.length == 3).to.be.true
      for a in r
        expect(a.tagId).to.be.undefined
        expect(a.tag).to.exist
        expect(a.tag._id).bsonId()
        expect(a.tag.name).to.exist
      DONE()


module.exports = ->

  DESCRIBE("queries", queries)
  DESCRIBE("opts", options)

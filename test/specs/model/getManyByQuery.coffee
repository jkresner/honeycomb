

queries = ->


  IT 'Gets all tags with no query ops', ->
    Tag.getManyByQuery {}, (e, r) ->
      expect(r.length>5).to.be.true
      DONE()


  IT 'Gets one by key as string value', ->
    Author.getManyByQuery {_id:'54551be15f221efa17111111'}, (e, r) ->
      expect(r.length).to.equal(1)
      DONE()


  IT 'Gets one by key as ObjectId', ->
    Author.getManyByQuery {_id:ObjectId('54551be15f221efa17111111')}, (e, r) ->
      expect(r.length).to.equal(1)
      DONE()


options = ->


  IT 'Gets only 2 tags with limit query ops', ->
    Tag.getManyByQuery {}, { limit: 2 }, (e, r) ->
      expect(r.length == 2).to.be.true
      DONE()




module.exports = ->

  DESCRIBE("queries", queries)
  DESCRIBE("options", options)

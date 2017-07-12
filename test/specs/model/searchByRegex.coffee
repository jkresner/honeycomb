

basic = ->


  IT 'Finds case matching by one field', ->
    Tag.searchByRegex 'Ruby on Rails', 'name', (e, r) ->
      expect(r.length>0).to.be.true
      expect(r[0]._id).bsonId()
      expect(r[0].name).to.equal('Ruby on Rails')
      expect(r[0].slug).to.equal('ruby-on-rails')
      DONE()


  IT 'Finds case not matching', ->
    Tag.searchByRegex 'Ruby ON rails', 'name', (e, r) ->
      expect(r.length>0).to.be.true
      expect(r[0]._id).bsonId()
      expect(r[0].name).to.equal('Ruby on Rails')
      expect(r[0].slug).to.equal('ruby-on-rails')
      DONE()


  IT 'Finds case matching when multiple fields specified', ->
    Tag.searchByRegex 'Ruby on Rails', 'name tokens', (e, r) ->
      expect(r.length>0).to.be.true
      expect(r[0]._id).bsonId()
      expect(r[0].name).to.equal('Ruby on Rails')
      expect(r[0].slug).to.equal('ruby-on-rails')
      DONE()


  IT 'No results when fields specified does not match', ->
    Tag.searchByRegex 'Ruby on Rails', 'tokens', (e, r) ->
      expect(r.length).to.equal(0)
      DONE()




module.exports = ->

  before (done) ->
    DB.ensureDoc 'Tag', FIXTURE.tags.rails, ->
      done()


  DESCRIBE("basic", basic)

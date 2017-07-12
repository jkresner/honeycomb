
basic = ->


  IT "creates without __v", ->
    suffix = @testSeed
    t = name: "Test__v#{suffix}", slug: "test-v-#{suffix}"
    Tag.create t, (e, r) ->
      DB.docById 'Tag', r._id, (tag) ->
        expect(tag._id).bsonId()
        expect(tag.name).to.equal("Test__v#{suffix}")
        expect(tag.slug).to.equal("test-v-#{suffix}")
        expect(tag.__v).to.be.undefined
        DONE()


  IT "creates", ->
    suffix = @testSeed
    t = name: "Test#{suffix}", slug: "test-#{suffix}"
    Tag.create t, (e, r) ->
      expect(r._id).bsonId()
      expect(r.name).to.equal("Test#{suffix}")
      expect(r.slug).to.equal("test-#{suffix}")
      DONE()


schema = ->

  IT "auto creates _id for nested schemas", ->
    suffix = @testSeed
    t = name: "Org-#{suffix}", teams: [{name:"Team1-#{suffix}"}]
    Org.create t, (e, r) ->
      expect(r._id).bsonId()
      expect(r.name).to.equal("Org-#{suffix}")
      expect(r.teams.length).to.equal(1)
      expect(r.teams[0].name).to.equal("Team1-#{suffix}")
      expect(r.teams[0]._id).bsonId()
      DONE()


  IT "restricts fields to schema", ->
    {bloat} = FIXTURE.auths
    DB.removeDocs 'Auth', { 'oauth.gp.id': bloat.oauth.gp.id }, ->
      Auth.create bloat, (e, r) ->
        expect(r.password).attr('hash', String)
        expect(r.password, 'created')
        expect(r.oauth.gp).attr('id', String)
        expect(r.oauth.gp).attr('name', String)
        expect(r.oauth.gp).attr('age', Number)
        expect(r.oauth.gp.email).to.be.undefined
        expect(r.oauth.gp.verified_email).to.be.undefined
        expect(r.oauth.gp.given_name).to.be.undefined
        expect(r.oauth.gp.family_name).to.be.undefined
        DB.docById 'Auth', r._id, (r2) ->
          # EXPECT.attr(r2.password,'hash', String)
          expect(r2.password.created).to.be.undefined
          expect(r2.oauth.gp).attr('id', String)
          expect(r2.oauth.gp).attr('name', String)
          expect(r2.oauth.gp).attr('age', Number)
          expect(r2.oauth.gp.email).to.be.undefined
          expect(r2.oauth.gp.verified_email).to.be.undefined
          expect(r2.oauth.gp.given_name).to.be.undefined
          expect(r2.oauth.gp.family_name).to.be.undefined
          DONE()


  IT "Create with undefined nested doc if not provided", ->
    {missingSubDoc} = FIXTURE.auths
    DB.removeDocs 'Auth', { '_id': missingSubDoc._id }, ->
      Auth.create missingSubDoc, (e, r) ->
        EXPECT.equalIds(r._id, missingSubDoc._id)
        expect(r.password).attr('hash', String)
        expect(r.oauth).to.be.undefined
        DB.docById 'Auth', r._id, (r2) ->
          EXPECT.equalIds(r2._id, missingSubDoc._id)
          expect(r2.password).attr('hash', String)
          expect(r2.oauth).to.be.undefined
          DONE()



module.exports = ->

  DESCRIBE("basic", basic)
  DESCRIBE("schema", schema)

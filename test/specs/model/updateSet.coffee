
basic = ->

  IT "can update a property", ->
    suffix = @testSeed
    DB.ensureDoc 'Tag', FIXTURE.tags.testupdateset, ->
      DAL.Tag.getById FIXTURE.tags.testupdateset._id, (e0, t0) ->
        expect(t0.slug).to.equal('test-update-set')
        DAL.Tag.updateSet t0._id, {slug:"#{t0.slug}-#{suffix}"}, (e1, t1) ->
          expect(t1.slug).to.equal("test-update-set-#{suffix}")
          DAL.Tag.getById FIXTURE.tags.testupdateset._id, (e2, t2) ->
            expect(t2.slug).to.equal("test-update-set-#{suffix}")
            DONE()


  IT "adds new _id of sub-schema in array", ->
    suffix = @testSeed
    t = name: "Org-#{suffix}", teams: [{name:"Team1-#{suffix}"}]
    DAL.Org.create t, (e1, r1) ->
      {teams} = r1
      teams.push({name:"Team2-#{suffix}"})
      DAL.Org.updateSet r1._id, {teams}, (e2, r2) ->
        expect(r2.name).to.equal("Org-#{suffix}")
        expect(r2.teams.length).to.equal(2)
        expect(r2.teams[0]._id).bsonId()
        expect(r2.teams[1]._id).bsonId()
        DONE()


module.exports = ->

  DESCRIBE("basic", basic)

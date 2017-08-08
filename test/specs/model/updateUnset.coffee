
basic = ->


  IT "can unset a property", ->
    DB.ensureDoc 'Tag', FIXTURE.tags.testupdateunset, ->
      Tag.getById FIXTURE.tags.testupdateunset._id, (e0, t0) ->        
        expect(t0._id).bsonId()
        expect(t0.extra).to.equal('junk')
        Tag.updateUnset t0._id, ['extra'], (e1, t1) ->
          expect(t1._id).bsonId()
          expect(t1.extra).to.be.undefined
          Tag.getById FIXTURE.tags.testupdateunset._id, (e2, t2) ->
            expect(t2._id).bsonId()
            expect(t2.extra).to.be.undefined
            DONE()


  IT "can unset a nested property", ->
    {tst11} = FIXTURE.users
    DB.ensureDoc 'Author', tst11, (e,r) ->
      expect(r._id).eqId(tst11._id)
      Author.getById tst11._id, (e0, u0) ->
        EXPECT.equalIds(u0._id,tst11._id)
        expect(u0.auth.gh.company).to.equal('Unset co.')
        Author.updateUnset tst11._id, ['auth.gh.company'], (e1, u1) ->
          EXPECT.equalIds(u1._id,tst11._id)
          expect(u1.auth.gh.id).to.equal(u0.auth.gh.id)
          expect(u1.auth.gh.company).to.be.undefined
          DONE()



module.exports = ->

  DESCRIBE("basic", basic)

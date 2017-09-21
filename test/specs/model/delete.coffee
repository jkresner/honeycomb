
basic = ->

  IT "deletes", ->
    DB.ensureDoc 'Tag', FIXTURE.tags.testdelete, ->
      DAL.Tag.getById FIXTURE.tags.testdelete._id, (e, t0) ->
        DAL.Tag.delete FIXTURE.tags.testdelete, (e2, r) ->
          expect(e2).to.be.null
          expect(r).to.be.undefined
          DAL.Tag.getById FIXTURE.tags.testdelete._id, (e3, t1) ->
            expect(e3).to.be.null
            expect(t1).to.be.null
            DONE()


module.exports = ->

  DESCRIBE("basic", basic)

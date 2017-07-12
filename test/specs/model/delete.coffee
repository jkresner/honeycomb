
basic = ->

  IT "deletes", ->
    DB.ensureDoc 'Tag', FIXTURE.tags.testdelete, ->
      Tag.getById FIXTURE.tags.testdelete._id, (e, t0) ->
        Tag.delete FIXTURE.tags.testdelete, (e2, r) ->
          expect(e2).to.be.null
          expect(r).to.be.undefined
          Tag.getById FIXTURE.tags.testdelete._id, (e3, t1) ->
            expect(e3).to.be.null
            expect(t1).to.be.null
            DONE()


module.exports = ->

  DESCRIBE("basic", basic)

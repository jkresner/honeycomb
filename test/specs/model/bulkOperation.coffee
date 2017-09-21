mongoose = ->

  IT "Insert 2 tags", ->
    {testbulkinsert1,testbulkinsert2} = FIXTURE.tags
    inserts = [testbulkinsert1,testbulkinsert2]
    DAL.Tag.bulkOperation inserts, [], [], (e, r) =>
      expect(e).to.be.null
      expect(r.insertedCount).to.equal(2)
      DB.docsByQuery 'Tag', {}, (tags) =>
        expect(tags.length).to.equal(2)
        expect(tags[0]).eqId(testbulkinsert1)
        expect(tags[1]).eqId(testbulkinsert2)
        DONE()

  IT "Update 2 tags", ->
    {testbulkupdate1,testbulkupdate2} = FIXTURE.tags
    inserts = [testbulkupdate1,testbulkupdate2]
    updates = []
    DAL.Tag.bulkOperation inserts, [], [], (e, r) =>
      DB.docsByQuery 'Tag', {}, (tags) =>
        expect(tags.length).to.equal(2)
        expect(tags[0].name).to.equal("Test Bulk Update 1")
        expect(tags[1].name).to.equal("Test Bulk Update 2")
        updates.push(assign(tags[0],{name:"Tst Bulk Updated 1"}))
        updates.push(assign(tags[1],{name:"Tst Bulk Updated 2"}))
        DAL.Tag.bulkOperation [], updates, [], (e, r) =>
          expect(r.modifiedCount).to.equal(2)
          DB.docsByQuery 'Tag', {}, (tags2) =>
            expect(tags2.length).to.equal(2)
            expect(tags2[0].name).to.equal("Tst Bulk Updated 1")
            expect(tags2[1].name).to.equal("Tst Bulk Updated 2")
            DONE()

  IT "Delete 2 tags", ->
    {testbulkdelete1,testbulkdelete2} = FIXTURE.tags
    inserts = [testbulkdelete1,testbulkdelete2]
    deletes = inserts.map((t) => _id: t._id)
    DAL.Tag.bulkOperation inserts, [], [], (e, r) =>
      DB.docsByQuery 'Tag', {}, (tags) =>
        expect(tags.length).to.equal(2)
        expect(tags[0].name).to.equal("Test Bulk Delete 1")
        expect(tags[1].name).to.equal("Test Bulk Delete 2")
        DAL.Tag.bulkOperation [], [], deletes, (e, r) =>
          expect(r.deletedCount).to.equal(2)
          DB.docsByQuery 'Tag', {}, (tags2) =>
            expect(tags2.length).to.equal(0)
            DONE()

  IT "Insert + update + delete (mixed transaction)", ->
    {testbulkinsert1,testbulkinsert2,
     testbulkupdate1,testbulkupdate2,
     testbulkdelete1,testbulkdelete2} = FIXTURE.tags

    inserts0 = [testbulkupdate1,testbulkupdate2,
                testbulkdelete1,testbulkdelete2]
    inserts = [testbulkinsert1,testbulkinsert2]
    updates = [assign({}, testbulkupdate1, {name:"Tst Bulk Mixed 1"}),
               assign({}, testbulkupdate2, {name:"Tst Bulk Mixed 2"})]
    deletes = [testbulkdelete1,testbulkdelete2].map((t) => _id: t._id)

    DAL.Tag.bulkOperation inserts0, [], [], (e, r) =>
      DB.docsByQuery 'Tag', {}, (tags) =>
        expect(tags.length).to.equal(4)
        expect(tags[0]).eqId(testbulkupdate1)
        expect(tags[1]).eqId(testbulkupdate2)
        expect(tags[2]).eqId(testbulkdelete1)
        expect(tags[3]).eqId(testbulkdelete2)
        DAL.Tag.bulkOperation inserts, updates, deletes, (e, r) =>
          expect(r.insertedCount).to.equal(2)
          expect(r.modifiedCount).to.equal(2)
          expect(r.deletedCount).to.equal(2)
          DB.docsByQuery 'Tag', {}, (tags2) =>
            expect(tags2.length).to.equal(4)
            expect(tags2[0]).eqId(testbulkupdate1)
            expect(tags2[1]).eqId(testbulkupdate2)
            expect(tags2[2]).eqId(testbulkinsert1)
            expect(tags2[3]).eqId(testbulkinsert2)
            DONE()


module.exports = ->

  beforeEach (done) =>
    DB.removeDocs 'Tag', {}, (r) => done()

  DESCRIBE("DA.mongoose", mongoose)
  DESCRIBE("DA.mongo", () =>
    it("Insert + update + delete")
  )


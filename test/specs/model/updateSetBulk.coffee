
basic = ->


  IT "can update an item of an array property", ->
    updates = []
    payoutId = new ObjectId()
    one = FIXTURE.orders.jkx_ordered_2015_n_owed
    DB.ensureDoc 'Order', one, (e,r) ->
      expect(r._id).to.exist
      expect(r.requestId).to.exist
      expect(r.lines.length).to.equal(3)
      expect(r.lines[2].unitPrice).to.equal(146) # not part of schema
      expect(r.by.name).to.equal("Edwin Herma")
      expect(r.log).to.be.undefined
      updates.push({_id:r._id, log:{last:'payout'}})
      Order.updateSetBulk updates, (e1, bulk) ->
        expect(bulk.modifiedCount).to.equal(1)
        DB.docById 'Order', one._id, (oneDB) ->
          expect(oneDB._id).to.exist
          expect(oneDB.lines.length).to.equal(3)
          expect(oneDB.lines[2].unitPrice).to.equal(146) # not part of schema
          expect(oneDB.lines[2].info.name).to.equal("60 min (Jon Hotter)")
          expect(oneDB.lines[2].info.paidout).to.equal(false)
          expect(oneDB.by.name).to.equal("Edwin Herma")
          expect(oneDB.log.last).to.exist
          EXPECT.equalIds(oneDB.requestId, one.requestId)
          Order.getById one._id, (e2, one2) ->
            {lines} = one2
            expect(lines[2].unitPrice).to.equal(146) # not part of schema
            expect(lines[2].info.name).to.equal("60 min (Jon Hotter)")
            expect(lines[2].info.paidout).to.equal(false)
            lines[2].info.paidout = payoutId
            Order.updateSetBulk [{_id:one2._id,lines}], (e2, bulk2) ->
              expect(bulk2.modifiedCount).to.equal(1)
              DB.docById 'Order', one._id, (oneDB2) ->
                expect(oneDB2._id).to.exist
                expect(oneDB2.lines[2].unitPrice).to.equal(146) # not part of schema
                expect(oneDB2.lines.length).to.equal(3)
                expect(oneDB2.lines[2].info.name).to.equal("60 min (Jon Hotter)")
                EXPECT.equalIds(oneDB2.lines[2].info.paidout, payoutId)
                expect(oneDB2.by.name).to.equal("Edwin Herma")
                expect(oneDB2.log.last).to.exist
                DONE()


module.exports = ->

  DESCRIBE("update", basic)

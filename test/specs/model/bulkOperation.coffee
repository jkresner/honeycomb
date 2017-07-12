inserts = ->

  IT "Insert multiple"

updates = ->

  IT "Update multiple"

deletes = ->

  IT "Delete multiple "

mixed = ->

  IT "Insert one and update 3"


module.exports = ->

  DESCRIBE.skip("inserts", inserts)
  DESCRIBE.skip("updates", updates)
  DESCRIBE.skip("deletes", deletes)
  DESCRIBE.skip("mixed", mixed)

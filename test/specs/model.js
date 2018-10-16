let camel = s => s.replace(s[0],s[0].toUpperCase())

module.exports = () =>

  before(function(done) {
    STUB.globals({
      DAL: honey.model.DAL,
      Enum: honey.model.Enum,
      honey: { cfg: () => {}, util: {
        String: {camel},
        Object: {renameAttrs:honey.util.Object.renameAttrs}
      } }
    })
    DB.ensureDocs('Author', Object.values(FIXTURE.authors), (e,r)=>done())
  })

  after(function() {
    STUB.restore.globals()
  })

  DESCRIBE("_enum", function() {
    IT("combines base + honey.Auth + App definitions", function() {
      expect(Enum).to.exist
      expect(Enum.MESSAGE).to.exist
      expect(Enum.AUTH.ORG).to.exist
      expect(Enum.AUTHOR).to.exist
      DONE()
    })
  })

  DESCRIBE("bulk", require('./model/bulkOperation'))
  DESCRIBE("create", require('./model/create'))
  DESCRIBE("delete", require('./model/delete'))
  DESCRIBE("getById", require('./model/getById'))
  DESCRIBE("getByQuery", require('./model/getByQuery'))
  DESCRIBE("getManyById", require('./model/getManyById'))
  DESCRIBE("getManyByQuery", require('./model/getManyByQuery'))
  DESCRIBE("searchByRegex", require('./model/searchByRegex'))
  DESCRIBE("updateSet", require('./model/updateSet'))
  DESCRIBE("updateSetBulk", require('./model/updateSetBulk'))
  DESCRIBE("updateUnset", require('./model/updateUnset'))

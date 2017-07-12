module.exports = () =>

  before(()=>{
    global.DAL = honey.model.DAL
    global.Auth = DAL.Auth
    global.User = DAL.User
    global.Tag = DAL.Tag
    global.Org = DAL.Org
    global.Order = DAL.Order

  })

  after(()=>{
    delete global.DAL
    delete global.Auth
    delete global.User
    delete global.Tag
    delete global.Org
    delete global.Order
  })

  // DESCRIBE("bulkOperation", require('./model/bulkOperation'))
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
  


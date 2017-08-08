module.exports = {

  set(config) {
    global.honey          = { libs: {} }
    global.config         = config

    global.assign         = Object.assign
    global.join           = require('path').join
    global.moment         = require('moment-timezone')
    
    global._              = require('lodash')

    honey.util            = {}
    honey.util.String     = require('../util/string')
    honey.util.BsonId     = require('../util/bsonid')
    honey.util.Object     = require('../util/object')
    _.select              = honey.util.Object.select
    _.idsEqual            = honey.util.BsonId.equal
    global.ID = { eq: honey.util.BsonId.equal }

    honey.cfg             = section => _.get(config, section)
    honey.fs              = require('./fs')

    global.LOG            = console.log
    global.TIME           = console.log
    global.TRACK          = () => {}
    global.$log           = console.log
    honey.log             = require('../log/index')(config)
       
    if (config.wrappers)
      global.Wrappers = {}      
    
    if (config.comm)  
      global.COMM = require('../comm/index')(config)
    
    return honey
  }

}
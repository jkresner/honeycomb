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
    _.idsEqual            = honey.util.BsonId.equal

    honey.cfg             = section => _.get(config, section)
    honey.fs              = require('./fs')

    global.LOG            = console.log
    global.TIME           = console.log
    global.$log           = console.log
       
    if (!config.wrappers) return
    global.Wrappers = {}
    
    return honey
  }

}
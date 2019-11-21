var {Configure} = require('../../../lib/index')
var config = Configure(__dirname, process.env.ENV || 'run')

var done = e => e ? console.log('APP.ERROR'.red, e) : ''


require('./app').run(config, done)

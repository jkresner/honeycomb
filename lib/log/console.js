module.exports = function(format) {

  return {
    it() {
      var args = [].slice.call(arguments)
      var str = format.line.apply(this, arguments)
      if (str)     
        process.stdout.write(str + '\n')
      return str
    },
    time(label, msg) {
      var str = format.time(label, msg)
      process.stdout.write(str + '\n')
      return str
    },
    error(e) {
      var str = config.env == "dev" 
              ? format.error.apply(this, arguments)
              : `${e}`

      if (!config.log.error.mute.test(e.message||e.toString()))
        process.stdout.write(str + '\n')
      
      return str
    },
    request(req, e, opts = {}) {
      var str = `${format.request(req, opts)} ${this.error(e)}`
      process.stdout.write(str)

      return str
    }
  }

}



module.exports = function(format) {

  return {
    it() {
      let str = format.line.apply(this, arguments)
      if (str)
        process.stdout.write(str + '\n')
      return str
    },
    time(label, msg) {
      let str = format.time(label, msg)
      if (str)
        process.stdout.write(str + '\n')
      return str
    },
    error(e) {
      let str = config.env == "dev"
              ? format.error.apply(this, arguments)
              : `${e}`

      if (!config.log.error.mute.test(e.message||e.toString()))
        process.stdout.write(str + '\n')

      return str
    },
    request(req, e, opts = {}) {
      let str = `${format.request(req, opts)} ${this.error(e)}`
      process.stdout.write(str)

      return str
    }
  }

}



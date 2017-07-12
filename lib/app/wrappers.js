function wire(dir) {

  honey.fs.childJs(dir).forEach(function(fileName) {
    var wrapper = honey.fs.require(dir, fileName)
    var name = wrapper.name || fileName

    if (Wrappers[name]) throw Error(`Wrapper [${name}] with exists, please use another name`)

    var wrapped = (fn, fnName) => function() {
      if (!Wrappers[name].api) {
        Wrappers[name].init()
        LOG('wrpr.init', 'init', name, fnName)
      }
      return fn.apply(this, arguments)
    }

    global.Wrappers[name] = { init: wrapper.init }
    for (var fn in wrapper) {
      if (fn != 'init' && fn != 'name')
        global.Wrappers[name][fn] = wrapped(wrapper[fn], fn)
    }

    LOG('app.wire', `WRAP ${name}`, Object.keys(Wrappers[name]))

  })

}


module.exports = {

  init() {
    config.wrappers.dirs.forEach(dir => wire(dir))
  },

  wire

}
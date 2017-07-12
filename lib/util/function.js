function init(_this, _arguments) { return {

  argsArray() {
    return [].slice.call(_arguments)
  },

  // hyjackFn takes the original callback as it's only param
  // and returns a function to be used as the new callback
  // e.g. var hyjack = () => (e,r) => cb(e, e ? null : project(r) )
  hyjackCallback(fn, hyjackFn) {
    var args = [].slice.call(_arguments)
    var cb = args.pop()
    args.push(hyjackFn(cb))
    return () => fn.apply(_this, args)
  }

}}

module.exports = {init}


module.exports = (app, mw) => {

  mw.cache('wrap', mw.req.wrap({
    context: config.middleware.ctx
  }))

}

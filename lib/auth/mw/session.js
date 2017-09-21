module.exports = (app, mw) => {

  const session = require('express-session')
  let cfg = honey.cfg('middleware.session')
  let store = honey.model.sessionStore(session, cfg)
  let project = _.get(honey,'projector.auth.Project.session')
  let opts = assign({session}, cfg, {store,project})
  if (cfg.restrict)
    opts.restrict = req => new RegExp(cfg.restrict).test(req.ctx.ud)

  return mw.session.touch(opts)

}

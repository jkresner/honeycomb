module.exports = function(on, action, user) {
  if (!on)
    on = { log: { history: [] } }
  else if (!on.log)
    throw Error(`logAct ${action} failed. <on:Object>.log undefined`)

  var act = { action, _id: honey.projector._.id.new() }
  act.by = { _id: user._id, name: user.name }
  on.log.last = act
  on.log.history.push(act)
  return on.log
}

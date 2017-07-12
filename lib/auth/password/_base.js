
module.exports = function(app, cfg) {

  return feature => ({
    logic: honey.logic.auth[cfg.password[feature]],
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  })

}

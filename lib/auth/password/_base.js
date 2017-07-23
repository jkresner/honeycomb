
module.exports = 
  
  feature => ({
    logic: honey.logic.auth[config.auth.password[feature]],
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  })

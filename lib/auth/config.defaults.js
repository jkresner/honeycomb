const noDefault = '{{required}}'

const defaults = {
  appKey:                  noDefault,
  loginUrl:                '/',
  loggedinUrl:             '/',
  oauth: {
    github: {
      short:               'gh',
      signup:              true,
      login:               true,
      unlink:              false,      
      logic:               'oauth',
      clientID:            noDefault,
      clientSecret:        noDefault,
      scope:               ['user'],
      emails:              true,
      userAgent:           noDefault
    }
  },
  token: { 
    onetime: {
      url:                 'ott',
      logic:               'onetime',
      expiresIn:           '1h'
    },
    jwt: {
      algorithm:           undefined,
      secret:              noDefault
    }
  },
  password: {
    login: {
      master:              undefined,
      usernameField:       "emails.value",
      passwordField:       "auth.password.hash"
    },
    reset:                 { salt: noDefault },
    signup:                undefined
  },
  user: {
    settings:              undefined,
    roles:                 true
  }
}


module.exports = () => JSON.parse(JSON.stringify(defaults))

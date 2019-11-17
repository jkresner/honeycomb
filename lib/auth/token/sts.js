const jwt = require('jsonwebtoken') 

// Secure Token Server
module.exports = () => {
  let cfg = honey.cfg('auth.token')

  return {
    jwt: {

      generate(claims, expiresIn = '1h', ops = {}) {
        // let notBefore = ops.notBefore || 
        return jwt.sign(claims, cfg.jwt.secret, assign({expiresIn},ops))
      },
      
      verify(token, ops = {}) {
        try {
          let claims = jwt.verify(token, cfg.jwt.secret, ops)
          LOG('auth.token', 'jwt:verify', 'sts.jwt.verify')
          return claims
        } catch(e) {
          honey.log.error(e)
          return false
        }
      }
    
    }
  }
}

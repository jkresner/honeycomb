'user strict';

var util = require('util')
var {OAuth2Strategy} = require('passport-oauth')

var supported = ['github','stackoverflow','linkedin']
var midway = ['google','slack','facebook']


module.exports = function(provider) {
  if (midway.indexOf(provider) != -1) return require(`./${provider}`)
  else if (supported.indexOf(provider) == -1) return require(`passport-${provider}`)

  var Provider = require(`./${provider}`)()

  function Strategy(options, verify) {
    options = assign(Provider.defaults, options)

    if (Provider.customOpts)
      Provider.customOpts(options)

    OAuth2Strategy.call(this, options, verify)

    this.name = provider
    this._opts = options

    if (Provider.wrapperInject)
      Provider.wrapperInject({_oauth2:this._oauth2})

  }

  util.inherits(Strategy, OAuth2Strategy)

  if (Provider.customProto)
    Provider.customProto(Strategy)

  return Strategy

}

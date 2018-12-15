let util = require('util')
let {OAuth2Strategy, InternalOAuthError} = require('passport-oauth')


// var DEPRECATED_SCOPES = {
//   'https://www.googleapis.com/auth/userinfo.profile': 'profile',
//   'https://www.googleapis.com/auth/userinfo.email': 'email',
// }


function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://accounts.google.com/o/oauth2/v2/auth';
  options.tokenURL = options.tokenURL || 'https://www.googleapis.com/oauth2/v4/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'google';
}


util.inherits(Strategy, OAuth2Strategy);


Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get('https://www.googleapis.com/plus/v1/people/me', accessToken, function (e, body, res) {
    if (e)
      return done(new InternalOAuthError('failed to fetch google user profile', e),
        console.log('google.oauth.userProfile http response error\n${e}\n${body}'))

    try {
      console.log('userProfile.body'.yellow, body)
      let profile = { _json: JSON.parse(body) }

      // { provider: 'google', id: json.id, name: json.displayName, emails: [] }
      // let {displayName,emails,image} = json

      // if (emails)
      //   for (i = 0, len = emails.length; i < len; ++i) {
      //     profile.emails.push({ value: emails[i].value, type: emails[i].type })
      //   }

      // if (image)
      //   profile.photos = [{ value: image.url, primary: image.isDefault }]

      // profile._raw = body;
      // profile._json = json;

      // console.log('profile.ok', profile)
      done(null, profile)
    } catch(e) {
      done(e)
    }
  });
}


Strategy.prototype.authorizationParams = function(options) {
  var params = {};
  if (options.accessType) {
    params['access_type'] = options.accessType;
  }
  if (options.approvalPrompt) {
    params['approval_prompt'] = options.approvalPrompt;
  }
  if (options.prompt) {
    // This parameter is undocumented in Google's official documentation.
    // However, it was detailed by Breno de Medeiros (who works at Google) in
    // this Stack Overflow answer:
    //  http://stackoverflow.com/questions/14384354/force-google-account-chooser/14393492#14393492
    params['prompt'] = options.prompt;
  }
  if (options.loginHint) {
    // This parameter is derived from OpenID Connect, and supported by Google's
    // OAuth 2.0 endpoint.
    //   https://github.com/jaredhanson/passport-google-oauth/pull/8
    //   https://bitbucket.org/openid/connect/commits/970a95b83add
    params['login_hint'] = options.loginHint;
  }
  if (options.userID) {
    // Undocumented, but supported by Google's OAuth 2.0 endpoint.  Appears to
    // be equivalent to `login_hint`.
    params['user_id'] = options.userID;
  }
  if (options.hostedDomain || options.hd) {
    // This parameter is derived from Google's OAuth 1.0 endpoint, and (although
    // undocumented) is supported by Google's OAuth 2.0 endpoint was well.
    //   https://developers.google.com/accounts/docs/OAuth_ref
    params['hd'] = options.hostedDomain || options.hd;
  }
  if (options.display) {
    // Specify what kind of display consent screen to display to users.
    //   https://developers.google.com/accounts/docs/OpenIDConnect#authenticationuriparameters
    params['display'] = options.display;
  }
  if (options.requestVisibleActions) {
    // Space separated list of allowed app actions
    // as documented at:
    //  https://developers.google.com/+/web/app-activities/#writing_an_app_activity_using_the_google_apis_client_libraries
    //  https://developers.google.com/+/api/moment-types/
    params['request_visible_actions'] = options.requestVisibleActions;
  }
  if (options.openIDRealm) {
    // This parameter is needed when migrating users from Google's OpenID 2.0 to OAuth 2.0
    //   https://developers.google.com/accounts/docs/OpenID?hl=ja#adjust-uri
    params['openid.realm'] = options.openIDRealm;
  }
  return params;
}


module.exports = Strategy;

const noDefault = '{{required}}'
const c='cyan',g='gray',w='white',m='magenta',r='red',b='blue',y='yellow',s='green',u='{{undefine}}'


var defaults = {
  about:                     'package.json:name|version|author',
  auth: {
    appKey:                  noDefault,
    loginUrl:                '/',
    loggedinUrl:             '/',
    oauth: {
      github: {
        short:               'gh',
        signup:              true,
        login:               true,
        logic:               'oauth',
        clientID:            noDefault,
        clientSecret:        noDefault,
        scope:               ['user'],
        emails:              true,
        userAgent:           noDefault
      }
    },
    orgs:                    false,
    password: {
     "signup":               undefined,
     "login": {
       "master":             undefined,
       "usernameField":      "emails.value",
       "passwordField":      "auth.password.hash"
     },
     "reset":                { "salt": "$2a$08$Qn0unnOa4XH0pN.IRZHB4u" }
   },
    user: {
      cohort:                false,
      legacy:                false,
      roles:                 true
    }
  },
  comm: {
    mode:                    "stub",
    transports:              ["smtp","ses"]
  },
  http: {
    host:                    noDefault,
    port:                    3333,
    static: {
      bundles:               {},
      dirs:                  'public',
      favicon:               { root: noDefault, maxAge: 360*24*365000 },
      host:                  '/',
      opts:                  { maxAge: null, redirect: false },
      manifest:              null
    }
  },
  log: {
    appKey:                  noDefault,
    analytics:               undefined,
    //  model:
    //    mongoUrl:          undefined,
    //    collections:       { event: 'Event', impression: undefined, issue: undefined }
    errors: {
      mute:                  undefined,
      mail:                  { sender: "ERR <mode@honey.stub>", to: noDefault }
    },
    it: {
      app:                   { init:b,lapse:w,sublapse:g,require:u,wire:u },
      auth:                  { init:u,link:s,local:s,login:s,oauth:s,signup:s },
      cfg:                   { init:u,middleware:u,route:u,sitemap:u },
      comm:                  { init:u,chat:u,mail:g,push:u,send:g }, //touser:u, togroup:u, error:u
      modl:                  { init:y,connect:s,cache:w,proj:u,read:u,write:u },
      mw:                    { init:u,trace:u,api:u,apiJson:u,forward:u,noCrawl:u,valid:u,page:u,notFound:r,error:r,forbid:u,authRedirect:u,oauth:u,logout:u,cached:u,param:u,recast:u,project:u,wrap:u,slow:u,orient:u,remember:u },
      trk:                   { init:u,issue:r,impression:u,event:y,view:c },
      wrpr:                  { init:u,call:u }
    },
    quiet:                   undefined,
    verbose:                 undefined
  },
  logic: {
    util:                    { dirs: undefined }
  },
  middleware: {
    api:                     { baseUrl: '/api' },
    json:                    {},
    jsonLimit:               { limit: '2mb' },
    ctx: {
      dirty:                 false,
      ip:                    true,
      ref:                   true,
      sId:                   true,
      user:                  true,
      ua:                    true,
      ud:                    { "android": "Android", "apple": "Apple-i", ban: "MJ12bot", search: "Googlebot"}, // "ms": "MSIE|Windows" },
      utm:                   true,
    },
    session: {
      anonData:              undefined,
      authdData:             '_id name scope',
      cookie:                { httpOnly: true, maxAge: 9000000 },
      // name:                  'sessions',
      restrict:              false,
      resave:                false,
      saveUninitialized:     true,
      secret:                'session_secret',
      store:                 { autoReconnect: true, collection: noDefault }
    }
  },
  model: {
    cache:                   undefined,
    domain: {
      mongoUrl:              noDefault
    }
  },
  routes: {
    auth:                    { on: true, test: false },
    pages:                   { on: true },
    redirects:               { on: false }
  },
  templates: {
    // appKey:                  undefined,
    dirs:                    { helpers: undefined, partials: undefined, views: 'server/views' },
    engines:                 'hbs,marked',
    model:                   undefined
  },
  wrappers: {
    dirs:                    undefined,
    smtp:                    undefined,
    ses:                     undefined
  }
}


module.exports = () => {
  var cfg = JSON.parse(JSON.stringify(defaults))
  for (var pattern in cfg.middleware.ctx.ud)
    cfg.middleware.ctx.ud[pattern] = new RegExp(cfg.middleware.ctx.ud[pattern])

  cfg.http.port = process.env.PORT || cfg.http.port
  return cfg
}


const noDefault = '{{required}}'
const c='cyan',g='gray',w='white',m='magenta',r='red',b='blue',y='yellow',s='green',n=null,u='{{undefine}}'


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
        userAgent:           noDefault,
      }
    },
    orgs:                    false,
    password:                undefined,
    // {
    //   "master":                "youshallpass",
    //   "usernameField":         "email",
    //   "passwordField":         "password",
    //   "resetSalt":             "$2a$08$Qn0unnOa4XH0pN.IRZHB4u"
    // },
    user: {
      cohort:                  false,
      legacy:                  false,
      roles:                   true
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
    analytics:               undefined, //{
    //model: {
    //   mongoUrl:           undefined,
    //   collections: {
    //     event:            'Event',
    //     impression:       undefined,
    //     issue:            undefined,
    //     view:             undefined
    //   }
    // }
    // },
    // ,verbose:n,debug:m,test:u,terse:u
    it: {
      app:                   {init:b,lapse:w,sublapse:g,wire:u,require:u},
      auth:                  {init:n,link:s,signup:s,login:s,oauth:s,local:s},
      cfg:                   {init:n,route:n,middleware:n,sitemap:n},
      comm:                  {init:n,mail:g,chat:u,push:u,send:g}, //touser:u, togroup:u, error:u
      modl:                  {init:y,connect:s,read:n,write:n,cache:w,proj:n},
      mw:                    {init:n,trace:n,api:n,forward:n,noCrawl:n,valid:n,page:u,notFound:r,error:r,forbid:u,authRedirect:u,oauth:u,logout:u,cached:u,param:u,recast:u,project:u,wrap:u,slow:u,orient:u,remember:u,logic:u},
      trk:                   {init:n,issue:r,impression:n,event:y,view:c},
      wrpr:                  {init:n,call:n}  //,apicall:n
    },
    errors: {
      mute:                  undefined,
      mail:                  { sender: "ERR <mode@honey.stub>", to: noDefault }
    }
  },
  logic: {
    util:                    { dirs: undefined },
    wax:                     { dirs: undefined }
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
      name:                  'sessions',
      restrict:              false,
      resave:                false,
      saveUninitialized:     true,
      secret:                'session_secret',
      store:                 { autoReconnect: true, collection: noDefault }
    }
  },
  model: {
    cache:                   undefined,    // { }
    domain: {
      mongoUrl:              noDefault
    }
  },
  routes: {
    redirects:               { on: false },
    whiteList:               { on: false }
  },
  templates: {
    appKey:                  undefined,
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
  defaults.http.port = process.env.PORT || 3333
  var cfg = JSON.parse(JSON.stringify(defaults))
  for (var pattern in cfg.middleware.ctx.ud)
    cfg.middleware.ctx.ud[pattern] = new RegExp(cfg.middleware.ctx.ud[pattern])
  return cfg
}


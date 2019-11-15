## HoneycombJS

Is a feature rich, plug and play node app framework.

Purpose built to assist the number live apps I could maintain at quality:

Honey aims to make your apps:

1. Beautifully simple

  - So they are easy to follow, especially years after not seeing your code
  - Write less boilerplate without compromising on customization (at all)

2. Quick to create

  - Use optional and highly configurable parts like caching or analytics

3. Reusable 

  - Compose apps of other apps with *.merge()*. Authentication comes in the box
  - Surface your logic across web, worker & test suites with no extra effort


### Consistent Web + Worker composition

> "Did I initialize the database connections and preload the cache in the 
right order in my batch process?"

With Honey, identical worker and web apps can be constructed with a
few lines. The complexity is taken care of under the hood so you can
quickly run that new mail campaign in a new worker without a worry. 

```javascript

let onReady = id => e => console.log(id+(e?` ERR ${e}`:` READY`))

let Honey   = require("honeycombjs") 
let config  = Honey.Configure(__dirname, process.env||'dev')
let model   = Honey.Model(config, onReady(`MODEL`))
let web     = Honey.App(config, onReady(`WEB`))
let worker  = Honey.Worker(config, onReady(`WORKER`))

web
  .honey
    .wire({model})
    .merge(Honey.Auth)
    .track(config.log.analytics)
    .inflate(config.model.cache)
    .chain(config.middleware, config.routes)
    .run()

worker
  .honey
    .wire({model})
    .inflate(config.model.cache)    
    .run()
    
```

### Tersely defined feature rich APIs and pages

```javascript

// ~./server/routes/api.js
module.exports = function(app, mw, config) {
  
  app.API('author')
    .params('post')
    .uses('authd')
    .post({ createPost:           'body'                   })
    .get ({ getPostInfo:          'post',
            getCollaborators:     'post'                   })
    .put ({ updateMarkdown:       'post body',              
            publishPost:          'post body.slug'         })
    .delete({ deletePost:         'post'                   })

  /* Serves json on 
    {api}/author/*
        POST    /createpost
        GET     /getpostinfo
        GET     /getcollaborators
        PUT     /updatemarkdown
        PUT     /publishpost
        DELETE  /deletepost
  */
}

```

In the above code the `param` *post* gets received in a 
request under the hood as req.params.postid and "hydrated"
by honey onto req.post as a fully inflated data object.

Should data access fail a `404 Not Found` or `401 Unauthorized`
will be sent without any validation or logic executed.

Because inputs/data access/acl is taken care of for you 
under the hood, you can focus on writing, super clean /
human readable handers:

Of course with APIs we often needs some pages to consume and
use our endpoints. Here's how one for the authors endpoint
would look:

```javascript
// ~./server/routes/author.js
module.exports = function(app, mw, config) {
  
  let mount = config.mount || '/author'  
    
  honey.Router('author', {mount})
    .use(mw.$.authd)           // must be authenticated for author routes
    .use(mw.$.inflateMe)       // hydrate req.user with full user info from db
    .get('/new',
         '/edit/*',
         '/submit/*', 
            mw.res.reactPage)  // client-side html shell
    .get('/preview/*', 
            mw.res.page)       // server rendered / seo optimized 

}

```

### Validation, logic and data shaping separate... but together!

To handle the createpost api endpoint defined by

`  .post({ createPost:           'body'                  })`

```javascript
   
// ~./server/logic/author/createPost.js                                          */ 
module.exports = (DAL, Data, DRY) => ({

  // validate() always receives 'user' as its first param
  // followed request properties in your API definition (so "request.body")
  validate(user, {title,type,md}) {
    if (!user.roles.include('author')) return `Approved author status pending`
    if (!title) return `Title required`
    if (!type) return `Post type required`
    if (md) return `Unexpected markdown (use updateMarkdown instead?)`
  },

  // Write logic assuming all validation, access control passed
  exec(o, cb) {    
    o.md = "*My new post default body markdown*"
    
    // this.user = the identity executing the action
    o.by = Data.Project.by(this.user)
    
    // DRY ("Don't Repeat Yourself") an object to define/share common logic
    o.log = DRY.logEvent('new_post', this.user)

    // DAL ("Data Access Layer")
    DAL.Post.create(o, cb)
  },

  // Shape data with powerful projection functions
  project(post) {
    return Data.select(post, '_id title author.name author.avatar')
  }

})

```

Tight plumbing of the `validate` => `exec` => `project` sequence is taken
care of. If any step fails, E.g. if validate returns any valued Honey will 
gracefully abort sending the value as an http `403 Forbidden` response.
Without thinking about all the if (this) { ..do that.. } you can focus on
writing beautiful easily testable business logic.
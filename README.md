## HoneycombJS

Is a feature rich, plug and play node web / worker server side framework.


### Define your app

- Use `.merge` to combine your base app with any other app following honey
conventions.
- Don't need analytics or caching? Just comment out .track() / .inflate()


```javascript

let done    = e => console.log(e ? `APP.ERROR ${e}`, `APP.READY`)

let Honey   = require("honeycombjs") 
let config  = Honey.Configure(__dirname, ENV, true)
let model   = Honey.Model(config, done)
let app     = Honey.App(config, done)

app
  .honey
    .wire({model})
    .merge(Honey.Auth)
    .track(config.log.analytics)
    .inflate(config.model.cache)
    .chain(config.middleware, config.routes)
    .run()

```

### Define, route, middleware chain & APIs

```javascript

// server/routes/api.js
module.exports = function(app, mw, conf) {

  // api/author/createpost
  // api/author/getinfo
  // api/author/getcollaborators
  // api/author/updatemarkdown
  // api/author/updateinfo
  // api/author/updatesubmit
  // api/author/deletePost
  
  app.API('author')
    .params('post')
    .uses('authd')
    .post({ createPost:           'body'                   })
    .get ({ getInfo:              'post',
            getCollaborations:    'post'                   })
    .put ({ updateMarkdown:       'post body',              
            updateInfo:           'post body'
            updateSubmit:         'post body.slug'         })
    .delete({ deletePost:         'post'                   })

}

```


### Keep logic, validation and data manipulation organised

```javascript

// server/logic/author/createPost.js
module.exports = (DAL, Data, DRY) => ({

  validate(user, info) {
    if (!info.title) return `Title required`
    if (!info.type) return `Type required`
    if (info.assetUrl) return `Unexpected assetUrl`
    if (info.md) return `Unexpected markdown`
  },

  exec(o, cb) {
    o.by = Data.Project.by(this.user)
    o.md = "My new post body"
    o.log = DRY.logAct('create', this.user)

    // DAL = Data Access Layer
    DAL.Post.create(o, cb)
  },

  // Shape data with powerful projection functions
  project: Data.Project.info

})

```
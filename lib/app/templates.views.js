module.exports = function(app, {hbs,marked}) {

  var dirs = honey.cfg('templates.dirs')

  var viewsDir = dirs.views
  var setViewOpts = router => {
    router.locals = app.locals
    router.set('views', viewsDir)
    router.set('view engine', 'hbs')
    // router.set('view options', { layout: 'layout' })

    //-- Can access app.local.X and req.local.Y as @X and @Y
    hbs.localsAsTemplateData(router)
  }

  setViewOpts(app)

  for (var dir of dirs.partials||[])
    hbs.registerPartials(dir)

  function addHelper(name, fn) {
    // $log('dirs.helpers.register'.yellow, name)
    hbs.registerHelper(name, function() {
      // $log(`helper.${name}`.yellow)
      return new SafeString(fn.apply(this,arguments))
    })
  }

  var {SafeString} = hbs.handlebars
  hbs.registerHelper('JSON', val => JSON.stringify(val))
  for (var dir of dirs.helpers||[]) {
    var set = honey.fs.requireDir(dir)
    // $log('dirs.helpers.set', set)
    for (var group in set) {
      // $log('dirs.helpers.set.group', group, set[group])
      for (var name in set[group])
        addHelper(name, set[group][name])
    }
  }

  // app.engine('md', function(str, opts, fn) {
  //   try {
  //     fn(null, marked.parse(str).replace(/\{([^}]+)\}/g, (_, name) => opt[name] || ''))
  //   } catch (e) {
  //     fn(e)
  // }})
  app.setViewOpts = setViewOpts
}

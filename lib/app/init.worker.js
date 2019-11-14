module.exports = function(config, done) {

  var honey                  = require('./globals').set(config)
  honey.projector            = require('./projector')

  let jobs = {}
  let worker = {}

  worker.honey =  {
    wire({model}) {

      if (model) {
        honey.model = model
        TIME(`SET  APP MODEL`)
      }

      if (honey.cfg('templates'))
        honey.templates = require('./templates')(null, config)

      if (honey.cfg('logic')) {
        honey.logic = require('./logic').init()
      }

      if (honey.cfg('wrappers.dirs')) {
        honey.wrappers = require('./wrappers').init()
        TIME(`WIRED  Wrappers`)
      }

      return this
    },

    merge(app2) {
      var {dir,name,model,lib,logic,wrappers} = app2.mergeConfig(config)||{}
      if (model)
        honey.model.importSchemas(join(dir,'model'), model.opts)
      if (logic)
        require('./logic').extend(honey.logic, name, join(dir,'logic'))
      if (wrappers)
        require('./wrappers').wire(join(dir,'wrappers'))

      TIME(`MERGED  ${name}`)
      return this
    },

    track(opts) {
      var cfg = honey.cfg('log.analytics')
      if (!cfg) return this

      honey.analytics.init(opts, x => {
        TIME(`ANALYTICS ON (${Object.keys(cfg.model.collections)})`)
        this.inflate.call(this, honey.cfg('model.cache'))
      })

      return { inflate: x => ({ run: x => {} }) }
    },

    inflate() {
      let cfg = honey.cfg('model.cache')
      if (!cfg) return this
      honey.model.cache.prime(cfg, honey, () => this.run.call(this))
      return { run: x => ({}) }
    },

    run() {
      worker.logic = honey.logic
      worker.queueJob = (ms, name, inputs, done) => {
          jobs[name] = {
            work: function () {
              if (inputs.length == 0) return clearInterval(jobs[name].interval)
              let [logic,fn] = name.split('.')
              let start = moment()
              let input = inputs.pop()
              $log(`${moment().format("HH:mm:ss")} start\t`.blue.dim, `${name} ${input}`.gray)
              honey.logic[logic][fn].chain(input, (e,r) => {
                var end = moment()
                var ts = `${end.format("HH:mm:ss")} ${end.diff(start)}ms\t`
                if (e) {
                  console.error(`${ts} ${name}[${input}] error`.red, e.message)
                  // COMM.error(e, { subject:`{wkr} ${name} ${e.message}` })
                  clearInterval(jobs[name].interval)
                } else if (r)
                  console.log(`${ts}`.green.dim, `${name} ${input} done`.green)
                done(e, r)
              })
            }
          }
          jobs[name].interval = setInterval(jobs[name].work, ms)
        }
      done()
    }

  }

  return worker
}

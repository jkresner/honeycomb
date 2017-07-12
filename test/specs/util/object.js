var ObjectUtil = require('../../../lib/util/object')


module.exports = () => DESCRIBE("Util", function() {


  describe("Select", function() {

    IT("Simple prop", function() {

      var sample = { name: "pair of developers", weight: 190 }
      var result = ObjectUtil.select(sample,['name'])
      var keys = Object.keys(result)
      expect(keys.length).to.equal(1)
      expect(keys[0]).to.equal('name')
      expect(result.name).to.equal("pair of developers")
      DONE()

    })


    IT("Array and object props", function() {

      var sample = { name: "three developers", weight: 280, tags: ['js','mocha','mean'], company: { name: 'three and a keyboard' } }
      var result = ObjectUtil.select(sample,['weight','tags','company'])
      var keys = Object.keys(result)
      expect(keys.length).to.equal(3)
      expect(keys[0]).to.equal('weight')
      expect(keys[1]).to.equal('tags')
      expect(keys[2]).to.equal('company')
      expect(result.name).to.be.undefined
      expect(result.weight).to.equal(280)
      expect(result.tags.length).to.equal(3)
      expect(result.company.name).to.equal('three and a keyboard')
      DONE()

    })


    IT("Nested object and array props", function() {

      var sample = {
        company: { name: 'three and a keyboard', url: 'http://three.andakey.com' },
        total: 1500,
        lines: [
          { name: 'payment', amount: 1400 },
          { name: 'discount', amount: 100 }
        ]
      }

      var result = ObjectUtil.select(sample,['company.url','lines.name'])
      var keys = Object.keys(result)
      expect(keys.length).to.equal(2)
      expect(keys[0]).to.equal('company')
      expect(keys[1]).to.equal('lines')

      expect(Object.keys(result.company).length).to.equal(1)
      expect(result.company.name).to.be.undefined
      expect(result.company.url).to.equal('http://three.andakey.com')

      for (var line of result.lines) {
        expect(Object.keys(line).length).to.equal(1)
        expect(line.name).to.exist
        expect(line.amount).to.be.undefined
      }

      expect(result.lines[0].name).to.equal("payment")
      expect(result.lines[1].name).to.equal("discount")

      DONE()
    })

    SKIP("Nested object sibling props", function() {

      var sample = { user: {
        "_id":"54551be15f221efa17222215","name":"Expert Eight","email":"airpairtest8@gmail.com",
        "location":{"name":"Bengaluru, Karnataka, India","shortName":"Bengaluru","timeZoneId":"Asia/Calcutta"},
        "auth":{
          "gh":{
            "updated_at":"2015-11-16T04:30:17Z",
            "created_at":"2015-11-16T04:29:58Z",
            "following":0,"followers":3,
            "login":"ap-test8"
          }
        }
      }}

      var result = ObjectUtil.select(sample,['user.email','user.auth.gh.followers','user.auth.gh.login'])
      var keys = Object.keys(result.user)
      expect(keys.length).to.equal(2)
      expect(keys[0]).to.equal('email')
      expect(keys[1]).to.equal('auth')

      expect(Object.keys(result.user.auth).length).to.equal(1)
      expect(result.user.auth.gh.constructor==Object).to.be.true

      var ghKeys = Object.keys(result.user.auth.gh)
      console.log('result', result.user.auth)
      expect(ghKeys.length).to.equal(2)
      expect(ghKeys[0]).to.equal("followers")
      expect(ghKeys[1]).to.equal("login")

      expect(result.user.auth.gh.followers).to.equal(3)
      expect(result.user.auth.gh.login).to.equal('ap-test8')

      DONE()
    })

  })


  describe("Attr rename", function() {

    IT("Rename attr on single object", function() {

      var sample = { name: "three developers", weight: 280 }
      var result = ObjectUtil.renameAttr(sample,{from:'name',to:'title'})
      var keys = Object.keys(result)
      expect(keys.length).to.equal(2)
      expect(keys[0]).to.equal('weight')
      expect(keys[1]).to.equal('title')
      expect(result.name).to.be.undefined
      expect(result.weight).to.equal(280)
      expect(result.title).to.equal("three developers")
      DONE()

    })

  })

})


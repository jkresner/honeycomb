anon = ->

  IT '/not-existing', ->
    url = @test.title
    PAGE url, {contetType:/html/,status:404}, (html) =>
      expect(html).inc ['Error','Login']
      DONE()


authd = ->


  IT '/not-existing', ->
    url = @test.title
    LOGIN "jkg", (s) =>
      PAGE url, {contetType:/html/,status:404}, (html) =>
        expect(html).inc ['Error','Logout']
        DONE()

module.exports = ->

  DESCRIBE("ANNONYMOUS", anon)
  DESCRIBE("AUTHENTICATED", authd)

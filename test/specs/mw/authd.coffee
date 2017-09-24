anon = ->


  IT '[200] /', ->
    PAGE '/', { session: null }, (html) =>
      expect(html).inc 'Signin'
      DONE()

  IT '[302] /calendar => /?returnTo=/calendar', ->
    REDIRECT '/calendar', { session: null }, (text) =>
      expect(text).inc 'Redirecting to /?returnTo=/calendar'
      DONE()


authd = ->


  IT '[302] / => /calendar', ->
    LOGIN 'mwauthd', (session) =>
      expect(session._id).bsonIdStr()
      expect(session.name).to.equal('Jaye Kaye')
      REDIRECT '/', {}, (text) =>
        expect(text).inc 'Redirecting to /calendar'
        DONE()


  IT '[200] /calendar', ->
    LOGIN 'mwauthd', (session) =>
      expect(session._id).bsonIdStr()
      PAGE '/calendar', { status: 200 }, (text) =>
        expect(text).inc 'Logout'
        DONE()


module.exports = ->

  DESCRIBE("ANNONYMOUS", anon)
  DESCRIBE("AUTHENTICATED", authd)

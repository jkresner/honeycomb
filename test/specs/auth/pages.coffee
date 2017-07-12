

anon = ->


  IT '/ OK', ->
    PAGE '/', { authenticated: false }, (html) ->
      expect(html).inc 'Signin'
      DONE()

  IT '/calendar 302 to /?returnTo=/calendar', ->
    PAGE '/calendar', { authenticated: false, status: 302 }, (text) ->
      expect(text).inc 'Redirecting to /?returnTo=/calendar'
      DONE()


authd = ->


  IT '/ 302 to /calendar', ->
    LOGIN {key:'jkg',oaEmails:''}, (session) ->
      expect(session._id).to.exist
      expect(session.name).to.equal('Jonathon Kresner')
      PAGE '/', { status: 302 }, (text) ->
        expect(text).inc 'Redirecting to /calendar'
        DONE()


  IT '/calendar OK', ->
    LOGIN 'jkg', (session) ->
      expect(session._id).to.exist
      PAGE '/calendar', { status: 200 }, (text) ->
        expect(text).inc 'Logout'
        DONE()


module.exports = ->

  DESCRIBE("ANONYMOUS", anon)
  DESCRIBE("AUTHENTICATED", authd)

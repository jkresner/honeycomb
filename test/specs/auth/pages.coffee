

anon = ->


  IT '[200] /', ->
    PAGE '/', { session: null }, (html) ->
      expect(html).inc 'Signin'
      DONE()

  IT '[302] /calendar => /?returnTo=/calendar', ->
    REDIRECT '/calendar', { session: null }, (text) ->
      expect(text).inc 'Redirecting to /?returnTo=/calendar'
      DONE()


authd = ->


  IT '[302] / => /calendar', ->
    LOGIN {key:'jkg',oaEmails:''}, (session) ->
      expect(session._id).to.exist
      expect(session.name).to.equal('Jonathon Kresner')
      REDIRECT '/', {}, (text) ->
        expect(text).inc 'Redirecting to /calendar'
        DONE()


  IT '[200] /calendar', ->
    LOGIN 'jkg', (session) ->
      expect(session._id).to.exist
      PAGE '/calendar', { status: 200 }, (text) ->
        expect(text).inc 'Logout'
        DONE()


module.exports = ->

  DESCRIBE("ANONYMOUS", anon)
  DESCRIBE("AUTHENTICATED", authd)

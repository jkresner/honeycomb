DESCRIBE "ANON", ->


  IT '[200] anon /', ->
    PAGE '/', { session: null }, (html) =>
      expect(html).inc 'Signin'
      DONE()


  IT '[302] anon /calendar => /?returnTo=/calendar', ->
    REDIRECT '/calendar', { session: null }, (text) =>
      expect(text).inc 'Redirecting to /?returnTo=/calendar'
      DONE()


  IT '[302] authenticated / => /calendar', ->
    LOGIN 'mwauthd', (session) =>
      expect(session._id).bsonIdStr()
      expect(session.name).to.equal('Jaye Kaye')
      REDIRECT '/', {}, (text) =>
        expect(text).inc 'Redirecting to /calendar'
        DONE()


  IT '[200] authenticated /calendar', ->
    LOGIN 'mwauthd', (session) =>
      expect(session._id).bsonIdStr()
      PAGE '/calendar', { status: 200 }, (text) =>
        expect(text).inc 'Logout'
        DONE()

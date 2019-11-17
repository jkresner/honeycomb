module.exports = ->


  IT 'Password login with existing password set by user', ->
    login = email: "jkresner@yahoo.com.au", password: "asdfasdfasdfasdgfgsdfas"
    DB.ensureDoc 'User', FIXTURE.users.jky, (eDB, rDB) ->
      expect(rDB.emails[0].value).to.equal(login.email)
      SUBMIT "/auth/password/login", {email:login.email,password:'bogus'}, { status: 401 }, (e) ->
        expect(e.message).inc 'No matching credentials'
        SUBMIT "/auth/password/login", login, { accept: "text/plain", status: 302 }, (text) ->
          DONE()


  it 'Token onetime login fails for non-existing user'


  IT 'Token onetime login with existing user', ->
    {jkc} = FIXTURE.users
    email = jkc.emails[0].value
    text = handlebars.compile("""Hi {{to.first}}!\n\n- - -\n\n[magic link]({{url_magic}})""")
    CAL.templates["user_onetime_login:ses"] = 
      type : () => "mail"
      key : () => "user_onetime_login:ses"
      from : () => "Test <test@honey.test>"
      subject : () => "Login to Honey"
      text : text
      html : (data) => marked(text(data))

    DB.ensureDoc 'User', jkc, (eDB, rDB) ->
      expect(rDB.emails[0].value).to.equal("jk@climbfind.com")
      expect(rDB).eqId(jkc)
      spy = STUB.spy(COMM.transports.ses.api, 'sendMail')
      PUT "/users/onetime", {email}, (r) ->
        expect(r).to.exist
        expect(spy.calledOnce).to.be.true
        mail = spy.args[0][0]
        expect(mail.subject).to.equal("Login to Honey")
        slug = "/auth/ott/#{jkc._id}/"
        tokenIdx = mail.html.indexOf(slug)+slug.length
        expect(tokenIdx > -1).to.be.true
        token = mail.html.substring(tokenIdx).split('">')[0]
        PAGE "/auth/ott/#{jkc._id}/#{token}", { accept: "text/plain", status: 302 }, (text) ->
          DONE()    



  IT 'Github login with existing linked.gh match & no extra existing photos or emails', ->
    DB.ensureDoc 'User', FIXTURE.users.tst5, (e, r) ->
      LOGIN 'tst5', (session) ->
        expect(session).attrs('_id name')
        expect(session).eqId(FIXTURE.users.tst5)
        expect(session.name).to.equal("Expert Five")
        DB.docById 'User', session._id, (r) ->
          expect(session).eqId(r)
          expect(r.emails.length).to.equal(1)
          expect(r.emails[0]._id).to.exist
          expect(r.photos.length).to.equal(2)
          expect(r.photos[0].type).to.equal('github')
          expect(r.photos[0].primary is true).to.be.false
          expect(r.photos[1].type).to.equal('gravatar')
          expect(r.photos[1].primary).to.be.true
          expect(r.name).to.equal("Expert Five")
          expect(r.auth.gh.id).to.equal(11262470)
          expect(r.log.notes).to.be.undefined
          expect(r.log.history.length).to.equal(1)
          expect(r.log.last.action).to.equal('login')
          expect(r.log.last.by.name).to.equal("Expert Five")
          expect(r.log.last.by).eqId(session)
          expect(r.log.last).eqId(r.log.history[0])
          DONE()


  IT 'Github login with existing auth.gh match & existing extra photos + emails', ->
    DB.ensureDoc 'User', FIXTURE.users.tst1, ->
      LOGIN 'tst1', (session) ->
        expect(session).attrs('_id name')
        expect(session).eqId(FIXTURE.users.tst1)
        expect(session.name).to.equal("Expert One")
        DB.docById 'User', session._id, (r) ->
          expect(session).eqId(r)
          expect(r.emails.length).to.equal(2)
          expect(r.emails[0].value).to.equal('airpairtest1@gmail.com')
          expect(r.emails[0].origin).to.equal('manual:input')
          expect(r.emails[0].primary is true).to.be.true
          expect(r.emails[1].value).to.equal('test1ap@gmail.com')
          expect(r.emails[1].origin).to.equal('oauth:github')
          expect(r.emails[1].primary is true).to.be.false
          expect(r.emails[1]._id).to.exist
          expect(r.photos.length).to.equal(2)
          expect(r.photos[0].type).to.equal('gravatar')
          expect(r.photos[0].primary is true).to.be.true
          expect(r.photos[1].type).to.equal('github')
          expect(r.photos[1].primary).to.be.false
          expect(r.name).to.equal("Expert One")
          expect(r.auth.gh.id).to.equal(11261012)
          expect(r.roles).to.be.undefined
          expect(r.log.notes).to.be.undefined
          expect(r.log.history.length).to.equal(1)
          expect(r.log.last.action).to.equal('login')
          expect(r.log.last.by.name).to.equal("Expert One")
          expect(r.log.last.by).eqId(session)
          expect(r.log.last).eqId(r.log.history[0])
          DONE()



  IT 'Link github login with existing user matching on email', ->
    DB.removeDocs 'User', {"emails.value":"jkresner@yahoo.com.au"}, ->
      jky = FIXTURE.clone('users.jky',{omit:'auth'})
      jky.auth = { password: FIXTURE.users.jky.auth.password }
      expect(jky.auth.password).to.exist
      expect(jky.auth.gh).to.be.undefined
      DB.ensureDoc 'User', jky, ->
        LOGIN 'jky', (session) ->
          expect(session).attrs('_id name')
          expect(session).eqId(FIXTURE.users.jky)
          expect(session.name).to.equal("Jonathon Yahoo")
          DB.docById 'User', session._id, (r) ->
            expect(r).eqId(session)
            expect(r.emails.length).to.equal(1)
            expect(r.emails[0].value).to.equal('jkresner@yahoo.com.au')
            expect(r.emails[0].origin).to.equal('manual:input')
            expect(r.emails[0].primary is true).to.be.true
            expect(r.photos.length).to.equal(2)
            expect(r.photos[0].type).to.equal('gravatar')
            expect(r.photos[0].primary is true).to.be.true
            expect(r.photos[1].type).to.equal('github')
            expect(r.photos[1].primary).to.be.false
            expect(r.name).to.equal("Jonathon Yahoo")
            expect(r.auth.gh.id).to.equal(11258947)
            expect(r.log.notes).to.be.undefined
            expect(r.log.history.length).to.equal(2)
            expect(r.log.history[0].action).to.equal('signup')
            expect(r.log.history[1].action).to.equal('login')
            expect(r.log.last.action).to.equal('login')
            expect(r.log.last.by.name).to.equal("Jonathon Yahoo")
            expect(r.log.last.by).eqId(session)
            expect(r.log.last).eqId(r.log.history[1])
            DONE()


individuals = ->


  IT 'Password login with existing password set by user', ->
    login = email: "jkresner@yahoo.com.au", password: "asdfasdfasdfasdgfgsdfas"
    DB.ensureDoc 'User', FIXTURE.users.jky, (eDB, rDB) ->
      expect(rDB.emails[0].value).to.equal(login.email)
      SUBMIT "/auth/password/login", {email:login.email,password:'bogus'}, { status: 401 }, (e) ->
        expect(e.message).inc 'Incorrect'
        SUBMIT "/auth/password/login", login, { accept: "text/plain", status: 302 }, (text) ->
          DONE()


  IT 'Github login with existing linked.gh match & no extra existing photos or emails', ->
    DB.ensureDoc 'User', FIXTURE.users.tst5, (e, r) ->
      LOGIN {key:'tst5', oaEmails:'gh_emails_tst5'}, (session) ->
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



# orgs = ->
  # it 'Can link individual moving to team usage'
      # Step -1 (in a galaxy a long very very time ago)
#     expect('login with github')
#     expect('two emails jkresner@gmail.com and jk@microsoft.com')
#     expect(userId, mongo.Guid)

#     # Step 0 (in a galaxy a long time ago)
#     expect('login with github')
#     expect('two emails eugene@gmail.com and euqene@microsoft.com')
#     expect('verify:identity => microsoft verified (identity)')
#     # expect('verify:communications @gmail.com, verify @microsoft')
#       # ==> "Confirm your first request for help"
#     # Step 1 (now)
#     expect('works for logged or not logged in')
#     expect('form: corporate domain + credit card')
#     expect('emailed: set password => @microsoft.com')
#     expect('check existing accounts / identity')
#     # Step 2
#       # ==> case 1 (brand new user) "set your password"
#       # ==> case 2 (existin user)   "add team members"
#         # (come back to site) => Choose the financial controller
#         # (optional) "Link" your Enterpise provider
#           # Phone to AirPair
#             # Links connectionName to companyObject in our database
#             # Which uses we've (communication:verified)
#             # Teams
#               # Adm
#               # Finacial Controller
#               # Credits Card tokens
#               # Which slack group
#         # Invite other team members via AD or email
#         # Poll the enterprise connection / cut people off no longer employed
#     # Step 3
#     expect('team member accepts the invite @microsoft')
#     # we add userID to the connectName
#     # Step X
#     expect('Can ')


module.exports = ->

  DESCRIBE("Individuals", individuals)
  # DESCRIBE("Ors", orgs)

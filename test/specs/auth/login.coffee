
individuals = ->

  IT 'Password login with exisitng password set by user', ->
    login = email: "jkresner@yahoo.com.au", password: "asdfasdfasdfasdgfgsdfas"
    DB.ensureDoc 'User', FIXTURE.users.jky, (e, r) ->
      SUBMIT "/auth/password/login", {email:login.email,password:'bogus'}, { content:'json', status: 401 }, (e1) ->
        expect(e1.message).inc 'Incorrect'
        SUBMIT "/auth/password/login", login, { contentType:/text/, status: 302 }, (r) ->
          DONE()


  IT 'Github login with existing linked.gh match & no extra existing photos or emails', ->
    DB.ensureDoc 'User', FIXTURE.users.tst5, (e, r) ->
      LOGIN {key:'tst5',oaEmails:'gh_emails_tst5'}, (session) ->
        # expectExactFields(session,['_id','name','roles'])
        # expect(session.roles.length).to.equal(0)
        EXPECT.equalIdAttrs(session, FIXTURE.users.tst5)
        expect(session.name).to.equal("Expert Five")
        DB.docById 'User', session._id, (r) ->
          EXPECT.equalIdAttrs(session, r)
          expect(r.emails.length).to.equal(1)
          expect(r.emails[0]._id).to.exist
          # OI('r.meta', r.photos, r, session)
          expect(r.photos.length).to.equal(2)
          expect(r.photos[0].type).to.equal('github')
          expect(r.photos[0].primary is true).to.be.false
          expect(r.photos[1].type).to.equal('gravatar')
          expect(r.photos[1].primary).to.be.true
          expect(r.name).to.equal("Expert Five")
          expect(r.auth.gh.id).to.equal(11262470)
          # expect(r.roles.length).to.equal(0)
          expect(r.meta.notes).to.be.undefined
          expect(r.meta.activity.length).to.equal(1)
          expect(r.meta.lastTouch.action).to.equal('login')
          expect(r.meta.lastTouch.by.name).to.equal("Expert Five")
          EXPECT.equalIdAttrs(r.meta.lastTouch.by,session)
          EXPECT.equalIdAttrs(r.meta.lastTouch, r.meta.activity[0])
          DONE()


  IT 'Github login with existing auth.gh match & existing extra photos + emails', ->
    DB.ensureDoc 'User', FIXTURE.users.tst1, ->
      LOGIN 'tst1', (session) ->
        # expectExactFields(session,['_id','name','roles'])
        # expect(session.roles.length).to.equal(0)
        EXPECT.equalIdAttrs(session, FIXTURE.users.tst1)
        expect(session.name).to.equal("Expert One")
        DB.docById 'User', session._id, (r) ->
          EXPECT.equalIdAttrs(session, r)
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
          # expect(r.roles.length).to.equal(0)
          expect(r.meta.notes).to.be.undefined
          expect(r.meta.activity.length).to.equal(1)
          expect(r.meta.lastTouch.action).to.equal('login')
          expect(r.meta.lastTouch.by.name).to.equal("Expert One")
          EXPECT.equalIdAttrs(r.meta.lastTouch.by,session)
          EXPECT.equalIdAttrs(r.meta.lastTouch, r.meta.activity[0])
          DONE()



  IT 'Link github login with existing user matching on email', ->
    DB.removeDocs 'User', {"emails.value":"jkresner@yahoo.com.au"}, ->
      jky = FIXTURE.clone('users.jky',{omit:'auth'})
      jky.auth = { password: FIXTURE.users.jky.auth.password }
      expect(jky.auth.password).to.exist
      expect(jky.auth.gh).to.be.undefined
      DB.ensureDoc 'User', jky, ->
        LOGIN 'jky', (session) ->
          # expectExactFields(session,['_id','name','roles'])
          # expect(session.roles.length).to.equal(0)
          EXPECT.equalIdAttrs(session, FIXTURE.users.jky)
          expect(session.name).to.equal("Jonathon Yahoo")
          DB.docById 'User', session._id, (r) ->
            EXPECT.equalIdAttrs(session, r)
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
            # expect(r.roles.length).to.equal(0)
            expect(r.meta.notes).to.be.undefined
            expect(r.meta.activity.length).to.equal(2)
            expect(r.meta.activity[0].action).to.equal('signup')
            expect(r.meta.lastTouch.action).to.equal('login')
            expect(r.meta.lastTouch.by.name).to.equal("Jonathon Yahoo")
            EXPECT.equalIdAttrs(r.meta.lastTouch.by,session)
            EXPECT.equalIdAttrs(r.meta.lastTouch, r.meta.activity[1])
            DONE()



teams = ->
  it 'Can link individual moving to team usage'
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
  # DESCRIBE("Teams", teams)

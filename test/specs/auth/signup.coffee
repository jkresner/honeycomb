individuals = ->

  beforeEach (done) ->
    DB.removeDocs 'User', { 'auth.gh.id': 979542 }, -> done()


  IT "Fails without verified github email", ->
    LOGIN {key:'jkg',oaEmails:'gh_emails_unverified'}, {status:401}, (e) ->
      expect(e.message).inc("No verified email")
      expect(e.message).starts("No verified email")
      DONE()


  IT "Creates new user account with unrecognized github id", ->
    LOGIN {key:'jkg'}, (session) ->
      # expectExactFields(session,['_id','name'])
      # expect(session.scope.length).to.equal(0)
      expect(session._id.toString()).to.not.equal("549342348f8c80299bcc56c2")
      expect(session.name).to.equal("Jonathon Kresner")
      DB.docById 'User', session._id, (r) ->
        EXPECT.equalIdAttrs(session, r)
        # expect(r.emails.length>1).to.be.true
        # expect(r.scope.length).to.equal(0)
        expect(r.emails[0]._id).to.exist
        expect(r.photos.length).to.equal(1)
        expect(r.photos[0].type).to.equal('github')
        expect(r.name).to.equal("Jonathon Kresner")
        expect(r.auth.gh.id).to.equal(979542)
        # expect(r.meta.notes.length).to.equal(0)
        expect(r.meta.activity.length).to.equal(1)
        expect(r.meta.lastTouch.action).to.equal('signup')
        EXPECT.equalIdAttrs(r.meta.lastTouch, r.meta.activity[0])
        DONE()


  it "Saves correct cohort info for new users"



teams = ->
  it "creates new user with uppercase letters in email all as lowercase"
  it "cannot create a new user with email in another account"
  it "Can signup new user with corporate domain and credit card"




module.exports = ->

  DESCRIBE("Individual", individuals)
  # DESCRIBE("Team", teams)


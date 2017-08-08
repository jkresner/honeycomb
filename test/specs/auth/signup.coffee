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
        expect(r.log.history.length).to.equal(1)
        expect(r.log.last.action).to.equal('signup')
        EXPECT.equalIdAttrs(r.log.last, r.log.history[0])
        DONE()

  
  IT "Facebook signup & login creates one user", ->
    {fb_jk} = FIXTURE.oauth
    opts = status: 200, contentType: /json/
    DB.removeDocs 'User', { 'emails.value': fb_jk.email }, -> 
      OAUTH {_json:fb_jk,provider:'facebook'}, opts, (s1) ->
        jkId = s1._id
        expect(s1.name).to.equal(fb_jk.name)        
        DB.docById 'User', jkId, (u1) -> 
          expect(u1._id).eqId(jkId)
          expect(u1.auth).to.exist
          expect(u1.auth.fb).to.exist
          expect(u1.auth.fb.id).to.equal(fb_jk.id)
          LOGOUT ->
            OAUTH {_json:fb_jk,provider:'facebook'}, opts, (s2) ->
              expect(s1._id).eqId(s2._id)
              DONE()
  


  it "Saves correct cohort info for new users"



teams = ->
  it "creates new user with uppercase letters in email all as lowercase"
  it "cannot create a new user with email in another account"
  it "Can signup new user with corporate domain and credit card"




module.exports = ->

  DESCRIBE("Individual", individuals)
  # DESCRIBE("Team", teams)


module.exports = ->


  IT "OAUTH.gh fails without verified github.email", ->
    LOGIN 'auth_unverified', {status:401,accept:'json'}, (e) =>
      expect(e.message).starts("No verified email")
      DONE()


  IT "OAUTH.gh creates user with new github.id", ->
    uniqs = 'auth.gh.id auth.gh.login auth.gh.emails.email'
    key = FIXTURE.uniquify('users', 'auth_ghnew', uniqs)
    LOGIN key, (session) =>
      expect(session).attrs(['_id','name'])
      expect(session._id.toString()).to.not.equal("549342348f8c80299bcc56c2")
      expect(session.name).inc("Jono Kaye")
      DB.docById 'User', session._id, (r) =>
        expect(session).eqId(r)
        expect(r.emails.length).to.equal(2)
        expect(r.emails[0]._id).bsonId()
        expect(r.emails[1]._id).bsonId()
        expect(r.photos.length).to.equal(1)
        expect(r.photos[0]._id).bsonId()
        expect(r.photos[0].type).inc('github')
        expect(r.name).to.equal("Jono Kaye")
        expect(r.auth.gh.id).to.equal(FIXTURE.users[key].auth.gh.id)
        expect(r.log.history.length).to.equal(1)
        expect(r.log.last.action).to.equal('signup')
        expect(r.log.last).eqId(r.log.history[0])
        DONE()


  IT "OAUTH.fb creates one user for signup + login", ->
    {fb_jk} = FIXTURE.oauth
    opts = status: 200, contentType: /json/, accept: "application/json"
    DB.removeDocs 'User', { 'emails.value': fb_jk.email }, (r) =>
      OAUTH {_json:fb_jk,provider:'facebook'}, opts, (s1) =>
        jkId = s1._id
        expect(s1.name).to.equal(fb_jk.name)
        DB.docById 'User', jkId, (u1) =>
          expect(u1._id).eqId(jkId)
          expect(u1.auth).to.exist
          expect(u1.auth.fb).to.exist
          expect(u1.auth.fb.id).to.equal(fb_jk.id)
          LOGOUT () =>
            OAUTH {_json:fb_jk,provider:'facebook'}, opts, (s2) =>
              expect(s1).eqId(s2)
              DONE()


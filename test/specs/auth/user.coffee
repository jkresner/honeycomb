module.exports = ->


  IT.skip 'Update password', ->


  IT.skip 'Update primary email', ->
    DB.removeDocs 'User', { 'auth.gh.id': 979542 }, ->
      LOGIN {key:'jkg',oaEmails:'gh_emails_jk'}, (session) ->
        # expect(session.emails).to.be.undefined
        GET '/users/me', (r) ->
          expect(r.emails.length).to.equal(2)
          expect(r.emails[0].value).to.equal("jk@gmail.com")
          expect(r.emails[0].primary is true).to.be.false
          expect(r.emails[0]._id).to.exist
          expect(r.emails[1].value).to.equal("jk@pair.com")
          expect(r.emails[1].primary is true).to.be.true
          expect(r.emails[1]._id).to.exist
          expect(r.emails[0]._id.toString()!=r.emails[1]._id.toString()).to.be.true
          PUT '/users/primaryemail', r.emails[0], (r1) ->
            expect(r1.emails.length).to.equal(2)
            expect(r1.emails[0].value).to.equal("jk@gmail.com")
            expect(r1.emails[0].primary is true).to.be.true
            expect(r1.emails[1].value).to.equal("jk@pair.com")
            expect(r1.emails[1].primary is true).to.be.false
            DONE()


  IT 'Update avatar (primary photo)', -> 
    uniqs = 'name emails.value auth.fb.id auth.fb.name auth.fb.email'
    key = FIXTURE.uniquify('users', 'jkc', uniqs)
    u = FIXTURE.users[key]
    DB.ensureDoc 'User', u, (eDB, rDB) ->
      OAUTH {provider:'facebook', _json: u.auth.fb}, () ->
        # expect(session.emails).to.be.undefined
        GET '/users/me', (r) ->
          expect(r.photos.length).to.equal(1)
          expect(r.photos[0].value).to.equal("https://scontent.xx.fbcdn.net/v/t31.0-1/c124.0.480.480/p480x480/1292368_639194289544_253203027_o.jpg")
          expect(r.photos[0].primary is true).to.be.true
          expect(r.photos[0]._id).to.exist
          avatar = 
            type: 'gravatar'
            value: honey.projector._.gravatar(r.emails[0].value)            
          PUT '/users/avatar', avatar, (r1) ->
            expect(r1.photos.length).to.equal(2)
            expect(r1.photos[0].primary is false).to.be.true
            expect(r1.photos[0].type).to.equal('facebook')
            expect(r1.photos[1].value).to.inc("https://0.gravatar.com/avatar/")
            expect(r1.photos[1].primary is true).to.be.true
            PUT '/users/avatar', r1.photos[0], (r2) ->
              expect(r2.photos.length).to.equal(2)
              expect(r2.photos[0].primary is true).to.be.true
              expect(r2.photos[0].type).to.equal('facebook')
              expect(r2.photos[1].primary is false).to.be.true              
              DONE()



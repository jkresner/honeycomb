
individuals = ->


  IT 'Update primary email', ->
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


#   it 'Disable email'

#   it 'Fails to disable primary email'


module.exports = ->

  DESCRIBE("Individuals", individuals)

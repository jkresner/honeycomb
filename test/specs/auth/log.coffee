module.exports = ->

  IT.skip "Auth history and cohort data", ->
    uniqs = 'auth.gh.id auth.gh.login auth.gh.emails.email'
    key = FIXTURE.uniquify('users', 'auth_ghnew', uniqs)
    PAGE "/", {}, (html) =>
      LOGIN key, (s) =>
        expect(s).attrs('_id name avatar')
        DB.docById s._id, (r) =>
          {last,history,sessions,visits} = r.log
          expect(last._id).bsonId()
          expect(last.act)
          expect(r.log.history.length).to.equal(1)


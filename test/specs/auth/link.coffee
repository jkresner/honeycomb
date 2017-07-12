link = ->


  IT 'Link stackoverflow profile', ->
    {so_apteam} = FIXTURE.oauth
    tst1 = FIXTURE.clone('users.tst1')
    DB.ensureDoc 'User', tst1, ->
      LOGIN 'tst1', (s) ->
        DB.docById 'User', tst1._id, (u1db) ->
          expect(u1db.auth.gh).to.exist
          expect(u1db.auth.so).to.be.undefined
          OAUTH so_apteam, ->
            DB.docById 'User', tst1._id, (u2db) ->
              expect(u2db.auth.gh).to.exist
              expect(u2db.auth.so).to.exist
              expect(u2db.auth.so.user_id).to.equal(so_apteam._json.user_id)
              DONE()


  IT 'Fails overwrite github profile', ->
    {gh_two} = FIXTURE.oauth
    tst1 = FIXTURE.clone('users.tst1')
    DB.ensureDoc 'User', tst1, ->
      LOGIN 'tst1', (s) ->
        DB.docById 'User', tst1._id, (u1db) ->
          expect(u1db.auth.gh).to.exist
          expect(u1db.auth.so).to.be.undefined
          OAUTH gh_two, {status:401,contentType:/json/}, (e) ->
            expect(e.message).inc("Unlink existing")
            DB.docById 'User', tst1._id, (u2db) ->
              expect(u2db.auth.gh).to.exist
              expect(u2db.auth.so).to.be.undefined
              DONE()


unlink = ->


  IT 'Unlink stackoverflow + linkedIN profiles & re-auth stackoverflow', ->
    {so_apteam} = FIXTURE.oauth
    {tst11} = FIXTURE.users
    DB.ensureDoc 'User', tst11, ->
      LOGIN 'tst11', (s) ->
        EXPECT.equalIds(s._id, tst11._id)
        DB.docById 'User', tst11._id, (u0db) ->
          expect(u0db.auth.gh).to.exist
          expect(u0db.auth.so).to.exist
          expect(u0db.auth.so.user_id).to.not.equal(so_apteam._json.user_id)
          expect(u0db.auth.in).to.exist
          OAUTH so_apteam, {status:401,contentType:/json/}, (e) ->
            expect(e.message).inc("Unlink existing")
            PUT "/users/unlinkoauth/stackoverflow", {}, (u1) ->
              expect(u1.auth.gh).to.exist
              expect(u1.auth.so).to.be.undefined
              expect(u1.auth.in).to.exist
              DB.docById 'User', tst11._id, (u1db) ->
                expect(u1db.auth.gh).to.exist
                expect(u1db.auth.so).to.be.undefined
                expect(u1db.auth.in).to.exist
                PUT "/users/unlinkoauth/linkedin", {}, (u2) ->
                  expect(u2.auth.gh).to.exist
                  expect(u2.auth.so).to.be.undefined
                  expect(u2.auth.in).to.be.undefined
                  DB.docById 'User', tst11._id, (u2db) ->
                    expect(u2db.auth.gh).to.exist
                    expect(u2db.auth.so).to.be.undefined
                    expect(u2db.auth.in).to.be.undefined
                    OAUTH so_apteam, {}, () ->
                      DB.docById 'User', tst11._id, (u2db) ->
                        expect(u2db.auth.gh).to.exist
                        expect(u2db.auth.so).to.exist
                        expect(u2db.auth.so.user_id).to.equal(so_apteam._json.user_id)
                        expect(u2db.auth.in).to.be.undefined
                        DONE()


  IT 'Fails unlink when provider unlink disable by config', ->
    expect(global.config.auth.oauth.github.unlink is false).to.be.true
    DB.ensureDoc 'User', FIXTURE.users.tst1, ->
      LOGIN 'tst1', (s) ->
        PUT "/users/unlinkoauth/github", {}, { status: 403 }, (err) ->
          expect(err.message).inc('github unlink not support by this app')
          DONE()



module.exports = ->

  DESCRIBE("OAUTH", link)
  DESCRIBE("UNLINK", unlink)

module.exports = ->


  IT "SES Send error mail w no opts to adm group", ->
    spy = STUB.spy(COMM.transports.ses.api, 'sendMail')
    err = Error("Try this one on for size")
    COMM.error err, (e, r) => 
      expect(e).to.be.null
      expect(spy.calledOnce).to.be.true
      expect(r.from).to.equal('ERR <team@test.com>')
      expect(r.to[0]).to.equal('jk <jk@air.test>')
      expect(r.to[1]).to.equal('abc <sbc@test.com>')
      expect(r.subject).to.equal(err.message)
      expect(r.text).inc('size **bold**')
      expect(r.html).to.be.undefined
      expect(r.messageId).to.exist
      DONE()


  IT "SES Send error mail w opts to an admin", ->
    spy = STUB.spy(COMM.transports.ses.api, 'sendMail')
    err = Error("Try this two on")
    opts = 
      subject: "{APPTESTK} #{err.message}"
      sender: "ERRORS <io@honey.stub>"

    COMM.error err, opts, (e, r) => 
      expect(e).to.be.null
      expect(spy.calledOnce).to.be.true
      expect(r.from).to.equal('ERRORS <io@honey.stub>')
      expect(r.to[0]).to.equal('jk <jk@air.test>')
      expect(r.to[1]).to.equal('abc <sbc@test.com>')
      expect(r.subject).to.equal("{APPTESTK} #{err.message}")
      DONE()      
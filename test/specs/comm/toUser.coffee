users = {
  jj: name: 'Jay', email: "jj@stub.io", push: false
  jg: name: 'Joe', email: false, push: false
  jk: name: 'Jon', email: "jony@jon.stub", push: "token123"
}


module.exports = ->


  before ->
    global.CAL =
      templates:
        'welcome:smtp':
          from: () -> "Honey <noreply@honey.stub>"
          subject: (data) -> "Welcome #{data.to.name}"
          text: (data) -> "Hi #{data.to.name},\n\n[activate](test.hon/#{data.hash})"
          html: (data) -> marked("Welcome #{data.to.name},\n\n[activate](test.hon/#{data.hash})")
        'activate:ses':
          from: () -> "Honey <noreply@honey.stub>"
          subject: (data) -> "Activate #{data.to.name}"
          text: (data) -> "Hey #{data.to.name},\n\n[activate](test.hon/activate?token=#{data.hash})"
          html: (data) -> marked("Hey #{data.to.name},\n\n[activate](test.hon/activate?token=#{data.hash})")
        'activate:pushr':
          text: (data) -> "#{data.to.name}, activate now!"
          click: (data) -> "app:uri(activate://#{data.hash})"

  after ->
    delete global.CAL


  IT "SMTP Send to user", ->
    spy1 = STUB.spy(COMM.transports.smtp.api, 'sendMail')
    spy2 = STUB.spy(COMM.transports.ses.api, 'sendMail')
    {jj} = users
    data = hash: 'AAAABBBBCCC'
    COMM.toUser(jj).by({smtp:1}).send('welcome', data)
      .then (msgs) =>
        r = msgs[0]
        # expect(r.subject).to.exist
        expect(r.subject).to.equal("Welcome Jay")
        expect(spy1.calledOnce).to.be.true
        expect(spy2.calledOnce).to.be.false
        mail = spy1.args[0][0]
        expect(r.text).inc('Hi Jay')
        expect(r.html).inc('<a href="test.hon/AAAABBBBCCC')
        expect(r.messageId).to.exist
        expect(r.key.split(':')[1]).to.equal('smtp')
        expect(mail.from).to.equal("Honey <noreply@honey.stub>")
        expect(mail.messageTo).to.equal('Jay <jj@stub.io>')
        DONE()


  IT "SES Send to user", ->
    spy1 = STUB.spy(COMM.transports.smtp.api, 'sendMail')
    spy2 = STUB.spy(COMM.transports.ses.api, 'sendMail')
    {jk} = users
    data = hash: 'AAAABBBBDDD'
    COMM.toUser(jk).by({ses:1}).send('activate', data)
      .then (msgs) =>
        expect(msgs[0].subject).to.exist
        expect(spy1.calledOnce).to.be.false
        expect(spy2.calledOnce).to.be.true
        mail = spy2.args[0][0]
        expect(mail.from).to.equal("Honey <noreply@honey.stub>")
        expect(mail.messageTo).to.equal('Jon <jony@jon.stub>')
        expect(mail.subject).to.equal("Activate Jon")
        expect(mail.text).inc('Hey Jon')
        expect(mail.html).inc('<a href="test.hon/activate?token=AAAABBBBDDD')
        expect(mail.messageId).to.exist
        expect(msgs[0].key).to.equal('activate:ses')
        DONE()


  IT "SES and Pushr Send to user", ->
    spy1 = STUB.spy(COMM.transports.smtp.api, 'sendMail')
    spy2 = STUB.spy(COMM.transports.ses.api, 'sendMail')
    spy3 = STUB.spy(COMM.transports.pushr.api, 'send')
    {jk} = users
    data = hash: 'BBBBDDD'
    COMM.toUser(jk).by({ses:1,pushr:1}).send('activate', data)
      .then (msgs) =>
        expect(msgs[0].subject).to.exist
        expect(msgs[1].click).to.exist
        expect(spy1.calledOnce).to.be.false
        expect(spy2.calledOnce).to.be.true
        expect(spy3.calledOnce).to.be.true
        mail = spy2.args[0][0]
        expect(mail.html).inc('<a href="test.hon/activate?token=BBBBDDD')
        expect(mail.key).to.equal('activate:ses')
        push = spy3.args[0][0]
        expect(push.text).to.equal('Jon, activate now!')
        expect(push.click).to.equal('app:uri(activate://BBBBDDD)')
        DONE()

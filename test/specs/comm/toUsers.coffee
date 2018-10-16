users = {
  jj: name: 'Jay', email: "jj@stub.io", push: false
  jg: name: 'Joe', email: "joe@stub.hon", push: false
  jk: name: 'Jon', email: "jony@jon.stub", push: "token123"
}


module.exports = ->

  before ->

    global.CAL =
      templates:
        'job:ses':
          from: () -> "Honey <noreply@honey.stub>"
          subject: (data) -> "New job for #{data.to.name}"
          text: (data) -> "Hey #{data.to.name},\n\n[#{data.job.title}](test.hon/job/#{data.job._id})"
          html: (data) -> marked("Hey #{data.to.name},\n\n[#{data.job.title}](test.hon/job/#{data.job._id})")
        'job:pushr':
          text: (data) -> "#{data.to.name}, job opportunity!"
          click: (data) -> "app:uri(job://#{data.job._id})"

  after ->
    delete global.CAL


  IT "Send many SES", ->
    spy1 = STUB.spy(COMM.transports.ses.api, 'sendMail')
    data = job: { title: 'JS Promise.All Testing', _id: '12312' }
    cb = (e) -> if e? then expect(e, e.message).to.be.null

    COMM.toUsers(Object.values(users), cb).by({ses:1}).send('job', data)
      .then (msgs) =>
        expect(msgs.length).to.equal(3)
        expect(spy1.called).to.be.true
        expect(spy1.callCount).to.equal(3)
        expect(msgs[0].subject).to.inc("New job for")
        expect(msgs[0].from).to.equal("Honey <noreply@honey.stub>")
        expect(msgs[0].messageTo).to.equal('Jay <jj@stub.io>')
        expect(msgs[1].messageTo).to.equal('Joe <joe@stub.hon>')
        expect(msgs[2].messageTo).to.equal('Jon <jony@jon.stub>')
        expect(msgs[0].text).inc('Hey Jay')
        expect(msgs[1].text).inc('Hey Joe')
        expect(msgs[2].text).inc('Hey Jon')
        expect(msgs[0].html).inc('<a href="test.hon/job/12312')
        expect(msgs[0].messageId).to.exist
        expect(msgs[0].key).to.equal('job:ses')
        DONE()


  IT "Send many mixed transports", ->
    spy1 = STUB.spy(COMM.transports.ses.api, 'sendMail')
    spy2 = STUB.spy(COMM.transports.pushr.api, 'send')
    data = job: { title: 'JS Promise.Catch Review', _id: '22222' }

    to = [users.jj, name: 'Jim', email: false, push: "token333"]
    opts =
      ses: (u) -> u.email
      pushr: (u) -> u.push
    COMM.toUsers(to).by({ses:1,pushr:1}, opts).send('job', data)
      .then (msgs) =>
        expect(msgs.length).to.equal(2)
        expect(spy1.calledOnce).to.be.true
        expect(spy2.calledOnce).to.be.true
        expect(msgs[0].subject).to.inc("New job for")
        expect(msgs[0].from).to.equal("Honey <noreply@honey.stub>")
        expect(msgs[0].messageTo).to.equal('Jay <jj@stub.io>')
        expect(msgs[0].text).inc('Hey Jay')
        expect(msgs[0].html).inc('<a href="test.hon/job/22222')
        expect(msgs[0].messageId).to.exist
        expect(msgs[0].key).to.equal('job:ses')
        # expect(msgs[1].to).to.equal("token123")
        expect(msgs[1].text).inc('Jim, job opportunity')
        expect(msgs[1].click).to.equal('app:uri(job://22222)')
        expect(msgs[1].key).to.equal('job:pushr')
        DONE()






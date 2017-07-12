module.exports = {

  bloat: {
    password: { hash: 'nbobobobob', created: new Date() },
    oauth: {
      gp: {
        id: '118272682188885899580',
        email: 'john.js.smith@gmail.com',
        verified_email: true,
        name: 'John Smith',
        given_name: 'John',
        family_name: 'Smith',
        age: 21,
      }
    }
  },

  missingSubDoc: {
    _id: ObjectId('5149dccb5fc6390200004442'),
    password: { hash: 'missssssing' }
  }

}

module.exports = {


  tst1: {
    _id : ObjectId("54551be15f221efa17111111"),
    name : "Author One",
    username: "Onsie",
    emails: [{ _id:ObjectId("56131305a094059aa7070c6c"), value: "airpairtest1@gmail.com", verified: true, primary: true, origin: 'manual:input' }],
    photos: [{ value: "6651e9e7b00694699b5f57968251626c", type: "gravatar", primary: true }],
    auth: {
      gh: {
        login: 'airpairtest1',
        id: 11261012,
        avatar_url: 'https://avatars.githxubusercontent.com/u/11261012?v=3',
        gravatar_id: '',
        name: "Onesy"
      }
    },
    "tagId" : ObjectId("5149dccb5fc6390200000013"),
    "log": { "history" : [] }
  },

  tst03: {
    _id : ObjectId("541111111111111a11111133"),
    name : "Author Three",
    username: "tres",
    emails: [{ _id:ObjectId("56131305a094059aa7070331"), value: "airtest3@gmail.com", verified: true, primary: true, origin: 'manual:input' }],
    auth: {
      in: {
        "lastName" : "Tres",
        "id" : "d9333111",
        "firstName" : "Air3"
      }
    },
    "tagId" : ObjectId("5149dccb5fc6390200000022"),
    "log": { "history" : [] }
  },

  tst11: {
    _id : ObjectId("541111111111111a11111111"),
    name : "Expert Elevan",
    username: "elvensie",
    emails: [{ _id:ObjectId("56131305a094059aa7070991"), value: "airpairtest11@gmail.com", verified: true, primary: true, origin: 'manual:input' }],
    auth: {
      gh: {
        login: 'airpairtest11',
        id: 11111111,
        avatar_url: 'https://avatars.githxubusercontent.com/u/11111111?v=3',
        gravatar_id: '',
        name: "Elevens"
      },
      so: {
        "badge_counts":{"bronze":11,"silver":11,"gold":11},
        "account_id":7111111,
        "last_access_date":1111111109,
        "reputation":11,
        "creation_date":1447758209,
        "user_type":"registered",
        "user_id":1171111,
        "link":"http://stackoverflow.com/users/1171111/air-pair",
        "profile_image":"https://lh6.googleusercontent.com/-tEGuZ5EdOw0/AAAAAAAAAAI/AAAAAAAAAEo/Tvt0ZoRCwv0/photo.jpg?sz=128",
        "display_name":"Air Eleven"
      },
      in: {
        "lastName" : "Eleven",
        "id" : "d9YF1111",
        "firstName" : "Airey"
      }
    },
    "tagId" : ObjectId("5149dccb5fc6390200000013"),
    "log": { "history" : [] }
  },


}

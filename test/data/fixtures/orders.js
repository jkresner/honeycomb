module.exports = {

  jkx_ordered_2015_n_owed: {
    "_id" : ObjectId("564e417505a707110003dc03"),
    "lines" : [
      {
        "_id" : ObjectId("564e417505a707110003dc02"),
        "type" : "payg",
        "qty" : 0,
        "total" : 0,
        "profit" : 0,
        "info" : { "name" : "$142 Paid" }
      },
      {
        "_id" : ObjectId("564e417505a707110003dc01"),
        "type" : "redeemedcredit",
        "qty" : 1,
        "total" : -4,
        "profit" : 0,
        "info" : { "name" : "$4 Redeemed Credit",
          "source" : ObjectId("5637bfab8b56ae11008597b4") }
      },
      {
        "bookingId" : ObjectId("564e417505a707110003dbff"),
        "_id" : ObjectId("564e417505a707110003dc00"),
        "type" : "airpair",
        "qty" : 1,
        "unitPrice": 146,
        "total" : 146,
        "profit" : 33,
        "info" : {
          "name" : "60 min (Jon Hotter)",
          "type" : "private",
          "time" : "2015-11-20T00:00:00.000Z",
          "minutes" : "60",
          "paidout" : false,
          "expert" : {
            "_id" : ObjectId("549342348f8c80333cccc6ee"),
            "name" : "Jon Hotter",
      //       "userId" : ObjectId("549342348f8c80333cccc6dd"),
          },
          "released" : {
            "action" : "release",
            "utc" : ISODate("2015-11-03T22:39:50.437Z"),
            "by" : {
              "_id" : ObjectId("545c1d5d8f8c80299bcc4f06"),
              "name" : "Edwin Herma"
            }
          }
        }
      }
    ],
    "requestId": ObjectId("545c1d5d222280299bcc4f06"),
    "by": {
      "_id": ObjectId("545c1d5d8f8c80299bcc4f06"),
      "name": "Edwin Herma"
    }
  }
}

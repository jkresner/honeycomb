module.exports = ({ Id, Enum, Touch },
  { asSchema, required, trim }) => {


var LineItem = asSchema({
  type:             { type: String, required, enum: ['payg','redeemedcredit','airpair'] },
  qty:              { type: Number, required },
  profit:           { type: Number, required },  // Margin taken by AirPair
  total:            { type: Number, required },  // Amount paid by customer
  info:             { type: {}, required },      // Arbitrary info about the line item
  bookingId:        { type: Id, ref: 'Booking' },
})


return asSchema({

  // The user that create the order (often same as userId, but can be an admin)
  by: {
    _id:          { type: Id, ref: 'User', required },
    name:         { type: String, required },
    avatar:       { type: String, required },
    email:        { type: String, required },
    org:          {}
  },

  lines:          { type: [LineItem] },

  meta:           {}

})

}

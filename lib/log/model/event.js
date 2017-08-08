module.exports = ({ Id },
  { asSchema, required, index }) => asSchema({


  app:       { type: String, required },
  ip:        { type: String, required },
  sId:       { type: String, index, sparse: true },
  uId:       { type: Id, index, sparse: true },

  name:      { type: String, required, index },
  data:      { type: {}, required },


})


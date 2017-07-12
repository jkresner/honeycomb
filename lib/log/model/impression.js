module.exports = ({ Id },
  { asSchema, required, index }) => asSchema({

  app:       { type: String, required: true },
  ip:        { type: String, required: true },
  sId:       { type: String, index: true, sparse: true },
  uId:       { type: Id, index: true, sparse: true },

  img:       { type: String, required: true },
  ua:        { type: String },
  ref:       { type: String, required: true }

})


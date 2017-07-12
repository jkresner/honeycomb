module.exports = ({ Id },
  { asSchema, required, index }) => asSchema({

  app:       { type: String, required: true },
  ip:        { type: String, required: true },
  sId:       { type: String, index: true, sparse: true },
  uId:       { type: Id, index: true, sparse: true },

  oId:       { type: Id, required: true },
  ref:       { type: String },
  type:      { type: String, required: true, lowercase: true },
  ua:        { type: String },
  url:       { type: String, required: true },
  utm:       { type: {} }

})


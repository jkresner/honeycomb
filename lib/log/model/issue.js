module.exports = ({ Id },
  { asSchema, required, index }) => asSchema({

  app:       { type: String, required: true },
  ip:        { type: String, required: true },
  uId:       { type: Id, index: true, sparse: true },
  sId:       { type: String, index: true, sparse: true },

  type:      { type: String, required: true, enum: ['custom','error','security','performance','metric'] },
  data:      { type: {}, required: false },
  ctx:       { type: {}, required: false },
  ua:        { type: String }

})


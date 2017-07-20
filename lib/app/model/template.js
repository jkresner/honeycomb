module.exports = ({ Enum },
  { asSchema, required, trim, lowercase, unique }) =>


asSchema({

  key:          { type: String, required, trim, lowercase, unique },
  type:         { type: String, required, enum: Enum.TEMPLATE.TYPE },
  
  part:         { type: Object, required },
  // e.g.
    // sender:     { type: String, required },
    // body:       { type: String, required },
    // subject:    { type: String },    
    // title:      { type: String },        
  // }

  description:  { type: String },
  
})

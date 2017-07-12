module.exports = ({ Id },
  { asSchema, required, index }) => asSchema({

    name:      { type: String, required },
    code:      { type: String, required },
    brand:     { type: String, required },
    teamId:    { type: Id, required },
    start:     { type: Date, required },
    end:       { type: Date, required },
    spend:     { type: Number, required },
    target:    { type: Number },
    ads:       [{}]

})


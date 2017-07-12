module.exports = ({ Id }, { asSchema, required, unique, lowercase }) => {

  var authGoogle = {
    id:                        { type: String, unique },
    name:                      { type: String },
    age:                       { type: Number }
  }

  return asSchema({                               // Full copies of profile data from oAuth
    password: {
      hash:                    { type: String }
    },
    oauth: {
      tw:                      { type: {}, required: false },
      so:                      { type: {}, required: false },
      gp:                      authGoogle,
    }
  })

}

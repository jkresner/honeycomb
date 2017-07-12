module.exports = ({ Id }, { asSchema }) => {

var Team = asSchema({

  name:     { type: String }

})


return asSchema({

  // E.g. Ruby on Rails
  name:     { type: String },

  // E.g. ruby-on-rails
  teams:    { type: [Team], required: false },

})


}

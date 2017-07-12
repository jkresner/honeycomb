module.exports = ({ Id }, { asSchema }) =>


asSchema({

  // E.g. Ruby on Rails
  name:     { type: String },

  // E.g. ruby-on-rails
  slug:     { type: String },

  // E.g. "ror,rails,rub"
  tokens:   { type: String }

})

module.exports = ({ Id, Enum },{ asSchema }) =>


asSchema({

  name:                      { type: String },
  username:                  { type: String },
  auth: {
    gh: {
      login:                 { type: String },
      id:                    { type: Number },
      avatar_url:            { type: String },
      gravatar_id:           { type: String },
      name:                  { type: String }
    },
    so:                      {},
    in:                      {},
  },
  tagId:                     { type: Id, ref: "Tag" },
  log:                       {},
  emails:                    {},
  photos:                    {}
})

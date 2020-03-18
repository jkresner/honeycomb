module.exports = ({ Id, Enum, Photo, Log },
  { asSchema, required, trim, lowercase, index, unique, sparse }) => {


var authFacebook = {
  id:                        { type: String, index, sparse, unique },
  picture:                   { type: {} },
  name:                      { type: String, trim },
  last_name:                 { type: String, trim },
  first_name:                { type: String, trim },
  link:                      { type: String, trim, lowercase },
  gender:                    { type: String, trim, lowercase },
  email:                     { type: String, trim },
  tokens:                    { type: {} }
}


var authGithub = {
  login:                     { type: String, trim },
  id:                        { type: Number, index, sparse, unique },
  avatar_url:                { type: String, trim },
  gravatar_id:               { type: String, trim },
  name:                      { type: String, trim },
  company:                   { type: String, trim },
  blog:                      { type: String, trim, lowercase },
  location:                  { type: String, trim },
  email:                     { type: String, trim },
  emails:                    { type: {}, required: false },
  hireable:                  { type: Boolean },
  bio:                       { type: String, trim },
  public_repos:              { type: Number },
  public_gists:              { type: Number },
  followers:                 { type: Number },
  following:                 { type: Number },
  created_at:                { type: String, trim },
  updated_at:                { type: String, trim },
  private_gists:             { type: Number },
  total_private_repos:       { type: Number },
  owned_private_repos:       { type: Number },
  plan: {
    name:                    { type: String, trim, lowercase },
    collaborators:           { type: Number },
    private_repos:           { type: Number }
  },
  tokens:                    { type: {} }
}


var authGoogle = {
  id:                        { type: String, index, unique, sparse },
  displayName:               { type: String, trim },
  picture:                   { type: String, trim, lowercase },
  gender:                    { type: String, trim, lowercase },
  emails:                    { type: {}, required: false },
  verified:                  { type: Boolean },
  url:                       { type: String, trim, lowercase },
  link:                      { type: String, trim, lowercase },
  //-- legacy
  name:                      {}, //{ type: String, trim },
  email:                     { type: String, trim },
  verified_email:            { type: Boolean },
  tokens:                    { type: {} }
}


var email = asSchema({
  // _id:                     { type: Id },
  value:                   { type: String, required, lowercase, trim, unique },
  verified:                { type: Boolean, required },
  origin:                  { type: String }, //, enum: Enum.AUTH.USER.EMAIL_SOURCE },
  primary:                 { type: Boolean, required },
  removed:                 { type: Date },   // Stop email being used / shown by AirPair
//-- Start: Would be nice to outsouce these features
  // lists:                   { type: {}, required: false, default: [] },  // (whitelist) 'AirPair Newsletter' / 'AirPair Content Digest'
  // silenced:                { type: [String] },  // (blacklist) 'expert-available' / 'new-message'
  // activity: {
    // sent: [{
      // utc:                   { type: Date },
      // subject:               { type: String },
//-- mechanism to confirm msgs get to inbox and signal address is no longer being checked
      // conversion:            [{
        // _id:                  { type: Id },                   // _id force generated to stamp time
        // type:                 { type: String, enum: Enum.USER.EMAIL_CONVERT_TYPE },
        // value:                { type: String }
      // }]
    // }],
  // }
})

var user = {

  emails:                    { type: [email] }, // required true
  photos:                    { type: [asSchema(Photo)] },

  email:                     { type: String, required: false, lowercase, trim  },
  avatar:                    { type: String, required: false, lowercase, trim  },
  
  name:                      { type: String, required, trim },
  initials:                  { type: String, lowercase, trim },
  username:                  { type: String, lowercase, unique, sparse },
  bio:                       { type: String },
  location:                  { type: {} },

  raw: {
    locationData:            { type: {}, required: false } // Used to recalculate timeZone
  },

  log:                       Log,  // Log of notable actions the user has taken over time

  auth: {                           // Full copies of profile data from oAuth
    password: {
      hash:                  { type: String }
    },   // to login in conjunction with any verified email in user.emails
    al:                      { type: {}, required: false },
    bb:                      { type: {}, required: false },
    fb:                      authFacebook,
    gh:                      authGithub,
    gp:                      authGoogle,
    in:                      { type: {}, required: false },
    sl:                      { type: {}, required: false },
    so:                      { type: {}, required: false },
    tw:                      { type: {}, required: false },
  },

  settings:                  { type : {}, required: false },
  role:                      { type: [String], required: false } 
}


  return asSchema(user)

}

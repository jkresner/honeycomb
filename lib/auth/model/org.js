module.exports = ({ Id, Enum, Photo, Meta },
  { asSchema, required, trim, lowercase, unique, sparse }) => {

var team = {
  creatorId:              { type: Id, ref: 'Users' },
//   paymethodId:            { type: ObjectId, ref: 'PayMethod' },
//   groupChatId:            { type: ObjectId, ref: 'Chat' },
  status:                 { type: String, enum: Enum.TEAM.STATUS },
  name:                   { type: String, required, trim },
  nickName:               { type: String, trim },
  slug:                   { type: String, trim, lowercase },
  avatar:                 Photo,
  invites: [{
    msgId:                { type: Id, ref: 'Messages', unique, sparse: false },
    to:                   { type: String }, // valid org domain email address
    status:               { type: String, enum: Enum.INVITE_STATUS },
  }],
  members: [{
    _id:                  { type: Id },                   // _id force generated to stamp time
    userId:               { type: Id, ref: 'Users', required },
    email:                { type: String, lowercase, trim },
    scopes:               [{ type: String, enum: Enum.TEAM.SCOPES }],     // essentially roles and permissions
    status:               { type: String, enum: Enum.TEAM.STATUS }
  }],
  meta:                Meta  // Log of notable actions team members have taken over time
}
var TeamSchema = asSchema(team)


var org = {
//   connection:               {},
  emailDomains:             [{ type: String, trim, lowercase }],
  info: {
    name:                   { type: String, trim, required },
    website:                { type: String, trim, lowercase },
  },
  cohort: {
    industry:               { type: String },
    category:               { type: String, enum: Enum.ORG.TYPE },
    staff:                  { type: String, enum: Enum.HEADCOUNT },
    developers:             { type: String, enum: Enum.HEADCOUNT }
  },
  teams:                    [TeamSchema]
}


  return asSchema(org)

}

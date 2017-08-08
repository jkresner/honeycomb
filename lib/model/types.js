// At some point split into separate files?

module.exports = (Id, Enum, {required, trim, lowercase}) => {

  var Message = {
    _id:                     { type: Id, required },
    key:                     { type: String, required },
    fromId:                  { type: Id, ref: 'User', required },
    toId:                    { type: Id },  // ref: 'User' or 'Org' or 'Team'
    rendered:                { type: [{}], required },  // Objs represeting sent Email / chatmsg / tweet
    ref: [{
      _id:                   { type: Id }, // connects to a domain object
      type:                  { String }
    }]
  }

  var Photo = {
    value:                   { type: String, required },
    type:                    { type: String, required, enum: Enum.PHOTO_TYPE },
    primary:                 { type: Boolean }
  }

  var Location = {
    name:                    { type: String, trim },    // "Sydney NSW, Australia"
    shortName:               { type: String, trim },    // "Sydney"
    timeZoneId:              { type: String, trim },    // "Australia/Sydney"
    geo: {
      country:               { type: Number },
      lat:                   { type: Number },
      lon:                   { type: Number } 
    }
  }

  var Htmlhead = {
    title:                   { type: String },
    description:             { type: String },
    canonical:               { type: String, lowercase, trim },
    ogUrl:                   { type: String, lowercase, trim },
    ogTitle:                 { type: String },
    ogType:                  { type: String },
    ogDescription:           { type: String },
    ogImage:                 { type: String, trim },
    ogVideo:                 { type: String, trim }
  }

  var Reftag = {
    _id:                     { type: Id, ref: 'Tag' },
    sort:                    { type: Number }
  }

  var Touch = {
    _id:                     { type: Id, required },  // _id force generated to stamp time
    action:                  { type: String, require, trim },
    by: {
      _id:                   { type: Id, ref: `User`, required },   //-- todo shrink this, maybe use 1 collection
      name:                  { type: String, required }
    }
  }

  var Note = {
    _id:                     { type: Id, required  },              // _id force generated to stamp time
    text:                    { type: String, required },
    by: {
      _id:                   { type: String, ref: `User`, required },
      name:                  { type: String, required }
    }
  }

  var Meta = {
    last:                    Touch,
    history:                 { type: [Touch] }
  }
  if (config.log.notes)
    Meta.notes =             { type: [Note] }
  if (config.log.comm)
    Meta.comm =              {}

  return { Id, Enum, Message, Photo, Location, Htmlhead, Reftag, Touch, Note, Meta }

}



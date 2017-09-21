module.exports = (Id, Enum, {required, trim, lowercase}) => {

  // let Message = {
  //   _id:                     { type: Id, required },
  //   key:                     { type: String, required },
  //   fromId:                  { type: Id, ref: 'User', required },
  //   toId:                    { type: Id },  // ref: 'User' or 'Org' or 'Team'
  //   rendered:                { type: [{}], required },  // objs representing sent Email / chatmsg / tweet
  //   ref: [{
  //     _id:                   { type: Id }, // connects to a domain object
  //     type:                  { String }
  //   }]
  // }

  // let Photo = {
  //   _id:                     { type: Id, required },
  //   value:                   { type: String, required },
  //   type:                    { type: String, required, enum: Enum.PHOTO_TYPE },
  //   primary:                 { type: Boolean }
  // }

  // let Location = {
  //   name:                    { type: String, trim },    // "Sydney NSW, Australia"
  //   shortName:               { type: String, trim },    // "Sydney"
  //   timeZoneId:              { type: String, trim },    // "Australia/Sydney"
  //   geo: {
  //     country:               { type: Number },
  //     lat:                   { type: Number },
  //     lon:                   { type: Number }
  //   }
  // }

  let Htmlhead = {
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

  // let Note = {
  //   _id:                     { type: Id, required  },              // _id force generated to stamp time
  //   text:                    { type: String, required },
  //   by: {
  //     _id:                   { type: String, ref: `User`, required },
  //     name:                  { type: String, required }
  //   }
  // }

  /* todo
  rename  Meta => Log
          Touch => Act
          Touch.action => Act.act
  change  Touch.by => Act.by: { type: Id, ref: `User`, required }
  add     Act.data: { type: {}, required: false }
  */
  var Act = {
    _id:                     { type: Id, required },  // _id force generated to stamp time
    action:                  { type: String, require, trim },
    by: {
      _id:                   { type: Id, ref: `User`, required },   //-- todo shrink this, maybe use 1 collection
      name:                  { type: String, required }
    },
    data:                    { type: {}, required: false }
  }

  let cfg = honey.cfg('log')
  var Log = {
    last:                    Act,
    history:                 { type: [Act] }
  }
  if (cfg.comm) Log.comm =   { type: {}, required: false }
  /* TODO remove Log.comm hack for climbfind */

  // if (cfg.notes)
    // Log.notes =          { type: [Note] }

  return { Id, Enum, Htmlhead, Act, Log }

}



module.exports = (Id, Enum, {required, trim, lowercase}) => {

  let Photo = {
    // _id:                     { type: Id, required },
    value:                   { type: String, required },
    type:                    { type: String, required, enum: Enum.PHOTO_TYPE },
    primary:                 { type: Boolean }
  }

  return {Photo}

}

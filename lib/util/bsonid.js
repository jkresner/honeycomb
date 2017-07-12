module.exports = {


  equal(id1, id2) {
    return id1.toString() == id2.toString()
  },


  toDate(id) {
    return new Date(parseInt(id.toString().slice(0, 8), 16) * 1000)
  },


  toMoment(id, format) {
    var mom = moment(
      new Date(parseInt(id.toString().slice(0, 8), 16) * 1000))

    return format ? mom.format(format) : mom
  }


}

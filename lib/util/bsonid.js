module.exports = {


  equal(id1, id2) {
    return id1.toString() == id2.toString()
  },


  toCompare(id) {
    return parseInt(id.toString().slice(0, 12), 16)
         + parseInt(id.toString().slice(12, 24), 16)
  },


  toDate(id) {
    return new Date(parseInt(id.toString().slice(0, 8), 16) * 1000)
  }


}

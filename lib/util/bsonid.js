module.exports = {


  equal(id1, id2) {
    return id1.toString() == id2.toString()
  },


  compare(a, b) {
    let aParts = [parseInt(a.toString().slice(0, 12), 16),
                  parseInt(a.toString().slice(12, 24), 16)]
        bParts = [parseInt(b.toString().slice(0, 12), 16),
                  parseInt(b.toString().slice(12, 24), 16)]
    if (aParts[0] < bParts[0]) return -1
    else if (aParts[0] > bParts[0]) return 1
    else if (aParts[1] < bParts[1]) return -1
    else if (aParts[1] > bParts[1]) return 1
    else return 0
  },


  toDate(id) {
    return new Date(parseInt(id.toString().slice(0, 8), 16) * 1000)
  }


}

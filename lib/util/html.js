module.exports = {


  preUnescape(str) {
    if (!str) return
    var blocks = str.match(/\<pre\>[\s\S]*\<\/pre\>/)
    if (!blocks) return str
    blocks.forEach(function(m){
      var clean = m.replace(/&amp;/g,'&')
      str = str.replace(m,clean)
    })
    return str
  },


  // http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
  encode(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }


}

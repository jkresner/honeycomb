String.prototype.remove = function (pattern) {
  return this.replace(pattern,'')
}

module.exports = {


  firstName(str) {
    return str.split(' ')[0]
  },


  lastName(str) {
    return str.replace(str.split(' ')[0]+ '' , '').trim()
  },


  camel(str) {
    return str[0].toUpperCase() + str.replace(str[0],'')
  },


  wordcount(text, mod) {
    var words = text.match(/\w+/g)
    var count = words ? words.filter(word => word.length>1).length : 0
    return mod ? count-(count%mod) : count
  },


  // toJson(str) {
  //   return (typeof str == 'string') ? JSON.parse(str) : str
  // },

  padRight(str, width) {
    width = width || 10
    padding = ''
    while (str.length+padding.length < width-1) padding+=' '
    return (str+padding).slice(0, width-1)+' '
  }


  // splitLines(lines, colLength, doc) {
  //   var i=0
  //   var changed = false
  //   // console.log('lines', colLength, lines.length, lines)
  //   while (lines[i] != null)
  //   {
  //     // console.log('i', lines[i].length, lines[i].indexOf(' '), lines[i])
  //     if (lines[i].length > colLength && lines[i].indexOf(' ') != -1)
  //     {
  //       changed = true
  //       var line = lines[i].substring(0,colLength)
  //       var lineColLength = line.lastIndexOf(' ')
  //       if (lineColLength == -1) {
  //         lineColLength = lines[i].indexOf(' ')
  //       }
  //       var extra = lines[i].substring(lineColLength+1, lines[i].length)
  //       lines[i] = lines[i].substring(0,lineColLength)

  //       // console.log(':::line[i+1]', lines[i+1].length)
  //       if (!lines[i+1])
  //         lines[i+1] = extra
  //       else if (lines[i+1].length == 0)
  //         lines.splice(i+1,0,extra)
  //       else {
  //         // console.log('extra', extra)
  //         lines[i+1] = extra + ' ' + lines[i+1]
  //       }

  //       // console.log('line[i+1]', lines[i+1])
  //     }

  //     i = i + 1;
  //   }
  //   if (changed && doc) doc.setValue(lines.join('\n'))
  //   // console.log('done', lines.length)
  //   return lines
  // }


}

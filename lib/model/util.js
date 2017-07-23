var util = {

  clone: (obj, assigns) => 
    JSON.parse(JSON.stringify(obj)),

  toCamelCase: (str) => str[0].toUpperCase() + str.replace(str[0],''),

  arrayAsObj(array, map) {
    var obj = {}
    array.forEach(name => obj[name] = map(name))
    return obj
  }

}


util.renameAttrs = function(original, renames) {
  function mapOne(obj) {
    for (var rename of renames)
      if (obj[rename.from] && rename.from != rename.to) {
        Object.defineProperty(obj, rename.to, Object.getOwnPropertyDescriptor(obj, rename.from))
        delete obj[rename.from]
      }
    return obj
  }

  return original.constructor == Array
            ? original.map(o => mapOne(o))
            : mapOne(original)
}


util.renameJoinAttrs = function(original, joinDefinition) {
  var renames = Object.keys(joinDefinition)
    .filter( attr => attr.indexOf('.') == -1 )  //-- not smart enough for nested yet
    .map( attr => ({from:attr,to:attr.replace('Id','')}) )

  return util.renameAttrs(original, renames)
}


module.exports = util

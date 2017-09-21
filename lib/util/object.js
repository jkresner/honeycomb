var isEmpty = function(obj) {
  if (obj == null) return true;
  if (obj.constructor === Object) return Object.keys(obj).length === 0;
  if (obj.constructor === Array) return obj.length === 0;
  return false
}


function nestedPick(object, keys) {
  if (!object) return null

  var copy  = {}
  var arrayKeys = {}
  for (var key of keys)
  {
    var props = key.split('.')
    if (props.length === 1)
    {
      if (typeof object[key] !== "undefined" && object[key] !== null)
        copy[key] = object[key]
    }
    else if (object[props[0]])
    {
      var nestedKey = key.replace(props[0]+'.','')
      if (object[props[0]].constructor === Array) {
        arrayKeys[props[0]] = arrayKeys[props[0]] || {}
        arrayKeys[props[0]][nestedKey] = 1
      }
      else
      {
        var result = nestedPick(object[props[0]], [nestedKey])
        if (!isEmpty(result)) {
          if (!copy[props[0]]) copy[props[0]] = result
          else {
            if (nestedKey.indexOf('.') == -1) {
              Object.assign(copy[props[0]], result)
            } else {
              var topProp = nestedKey.split('.')[0]
              if (copy[props[0]][topProp] && result[topProp])
                Object.assign(copy[props[0]][topProp],result[topProp])
              else if (result[topProp])
                copy[props[0]][topProp] = result[topProp]
            }
          }
        }
      }
    }
  }
  for (var arrayKey in arrayKeys)
  {
    copy[arrayKey] = []
    for (var i=0;i<object[arrayKey].length;i++) {
      var result = nestedPick(object[arrayKey][i], Object.keys(arrayKeys[arrayKey]))
      if (!isEmpty(result))
        copy[arrayKey][i] = result
    }
  }

  return copy
}


var util = {

  isEmpty,

  select(obj, selectList) {
    if (!obj || !selectList) return obj
    if (selectList.contructor === Object)
      selectList = Object.keys(selectList)
    else if (selectList.constructor === String)
      selectList = selectList.split(' ')
    return nestedPick(obj, selectList)
  },

  wrapFns(obj, wrapperFn) {
    Object.keys(obj).forEach(function(attr){
      if (obj[attr].contructor === Function)
        obj[attr] = wrapperFn(obj[attr], attr)
    })
    return obj
  },

  renameAttr(obj, map) {
    if (obj.hasOwnProperty(map.from) && map.from !== map.to) {
      let val = Object.getOwnPropertyDescriptor(obj, map.from)
      Object.defineProperty(obj, map.to, val)
      delete obj[map.from]
    }
    return obj
  },

  renameAttrs(o, maps) {
    if (o.constructor === Array)
      o.forEach(elem => maps.forEach(map => util.renameAttr(elem, map)))
    else
      maps.forEach(map => util.renameAttr(o, map))

    return o
  },

  clone(o, assigns) {
    var o2 = JSON.parse(JSON.stringify(o))
    if (assigns) Object.assign(o2,assigns)
    return o2
  }

}



module.exports = util

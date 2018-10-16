const sharp = require('sharp')


const extractOpts = opts => assign.apply(null, [{}].concat(
  ['left','top','width','height'].map((lb,idx) =>
    assign({ [lb]:parseInt(opts.split(',')[idx]) },{}))))


function sharpImg(input, dest, width, height, opts, cb) {
  let {rotate, extract, crop} = opts

  $log(`sharpen >> ${dest}`.yellow,
      ` rotate:${rotate?rotate:'0'}`+
      ` (pre)extract:${extract?extract:'no'}` +
      ` resize:(${width}x${height})` +
      ` (post)crop:${crop?crop:'no'}`)

  let img = sharp(input)
  // Pre-resize
  if (rotate) img.rotate(parseInt(rotate))
  if (extract) img.extract(extractOpts(extract))

  img.resize(width,height).max()

  // Post-resize
  if (crop) img.extract(extractOpts(crop))

  img.toFile(dest, (e,info) => {
    $log(`save.${width}x${height}[${dest.white}]`.cyan,
      e ? `${e}`.red
        : `${info.width}x${info.height}`.green + ` ${info.size} bytes`.white,
      JSON.stringify(info))

    cb(e, e ? null : assign(info,{dest}))
  })
}


module.exports = { sharpImg }

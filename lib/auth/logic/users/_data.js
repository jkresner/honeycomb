const Views = {
  me:        '_id name emails photos location auth'
}


module.exports = { Views,

  Projections: ({select}, {view}) => ({ 
    
    me: view.me

  })

}

const View = {
  me:        '_id name emails photos location auth'
}


module.exports = { 

  Projections: ({select}) => ({ 
    
    me: r =>
      select(r, View.me)

  })

}

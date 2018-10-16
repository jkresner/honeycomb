F = null
format = -> require(join(process.cwd(),"/lib/log/format"))


error = ->

  before ->
    STUB.globals({LOG:(()=>{}), honey:{ cfg: (x)=>{} } })
    F = format()

  after ->
    STUB.restore.globals()


  IT 'SyntaxError', ->
    str1 = F.error(SyntaxError("Unexpected token }"))
    expect(str1).to.exist
    lns1 = str1.split('\n')
    # console.log(str1, lns1.length, lns1)
    expect(lns1.length, "lns1 length equal 3").to.equal(3)
    expect(lns1[0]).inc("SyntaxError: Unexpected token }".red)
    DONE()


  IT 'With opts=maxLines:2', ->
    str1 = F.error(SyntaxError("Unexpected token }"), 2)
    # console.log(str1)
    expect(str1).to.exist
    lns1 = str1.split('\n')
    expect(lns1.length, lns1).to.equal(2)
    expect(lns1[0]).inc("SyntaxError: Unexpected token }".red)
    DONE()



module.exports = ->

  DESCRIBE("error", error)

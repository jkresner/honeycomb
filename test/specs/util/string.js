var StringUtil = require('../../../lib/util/string')


module.exports = () => DESCRIBE("Util", function() {

  IT('fistName', function() {
    expect(StringUtil.firstName("Jonathon Kresner")).to.equal("Jonathon")
    expect(StringUtil.firstName("Ra'Shaun Stovall")).to.equal("Ra'Shaun")
    expect(StringUtil.firstName("Scott Alexander-Bown")).to.equal("Scott")
    expect(StringUtil.firstName("Alisson Cavalcante Agiani")).to.equal("Alisson")
    expect(StringUtil.firstName("T Scott")).to.equal("T")
    expect(StringUtil.firstName("John")).to.equal("John")
    DONE()
  })


  IT('lastName', function() {
    expect(StringUtil.lastName("Jonathon Kresner")).to.equal("Kresner")
    expect(StringUtil.lastName("Ra'Shaun Stovall")).to.equal("Stovall")
    expect(StringUtil.lastName("Scott Alexander-Bown")).to.equal("Alexander-Bown")
    expect(StringUtil.lastName("Alisson Cavalcante Agiani")).to.equal("Cavalcante Agiani")
    expect(StringUtil.lastName("T Scott")).to.equal("Scott")
    expect(StringUtil.lastName("John")).to.equal("")
    DONE()
  })


  IT('camel', function() {
    expect(StringUtil.camel("Jonathon Kresner")).to.equal("Jonathon Kresner")
    expect(StringUtil.camel("jonathon Kresner")).to.equal("Jonathon Kresner")
    expect(StringUtil.camel("jonathon")).to.equal("Jonathon")
    DONE()
  })


  IT('padRight', function() {
    expect(StringUtil.padRight("jk", 5)).to.equal("jk   ")
    DONE()
  })


  IT('Wordcount', function() {
    expect(StringUtil.wordcount("")).to.equal(0)
    expect(StringUtil.wordcount("Hey how are you?")).to.equal(4)
    expect(StringUtil.wordcount("What the @#$@#$ is that a thing?")).to.equal(5)
    DONE()
  })



})

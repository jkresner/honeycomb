var FS        = require(join(process.cwd(),'/lib/app/fs'))
var dir       = join(process.cwd(),'/test/data/fixtures/fs')

module.exports = () => {

  before(()=> {
    STUB.globals({LOG:(()=>{})})
  })

  after(function() {
    STUB.restore.globals()
  })


  IT('childJs file names - opts = null', function() {
    let files = FS.childJs(dir)
    expect(files.length).to.equal(4)
    expect(files[0]).to.equal('_data')
    expect(files[1]).to.equal('_testfile3')
    expect(files[2]).to.equal('test_file1')
    expect(files[3]).to.equal('testfile2')
    DONE()
  })


  IT('childJs file names - opts.exclude = /^_/', function() {
    let files = FS.childJs(dir,{exclude:/^_/})
    expect(files.length).to.equal(2)
    expect(files[0]).to.equal('test_file1')
    expect(files[1]).to.equal('testfile2')
    DONE()
  })


  IT('childDirs dir names', function() {
    let dirs = FS.childDirs(dir)
    expect(dirs.length).to.equal(2)
    expect(dirs[0]).to.equal('test_dir2')
    expect(dirs[1]).to.equal('testdir1')
    DONE()
  })


  IT('require - no dependencies', function() {
    let required = FS.require(dir, 'test_file1')
    expect(required.isObject).to.be.true
    expect(required.isFunction).to.be.undefined
    DONE()
  })


  IT('require - with dependencies', function() {
    let dependencies = [{text:'test require with deps'}]
    let required = FS.require(dir, 'testfile2', dependencies)
    expect(required.isObject).to.be.undefined
    expect(required.isFunction).to.be.true
    expect(required.text).to.equal('test require with deps')
    DONE()
  })


  IT('requireDir - opts.file and opts.dependencies', function() {
    let dependencies = [{text:'test requireDir opts:null'}]
    let required = FS.requireDir(dir, {dependencies,files:['_testfile3','testfile2']})
    expect(required._testfile3.text).to.equal('test requireDir opts:null')
    expect(required._testfile3.isFunction).to.be.true
    expect(required.testfile2.isFunction).to.be.true
    expect(required.testfile2.text).to.equal('test requireDir opts:null')
    DONE()
  })

}

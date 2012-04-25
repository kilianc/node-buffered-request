var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    crypto = require('crypto'),
    should = require('should'),
    Assertion = should.Assertion,
    httpreq = require('request'),
    bufferedRequest = require('../'),
    version = require('../package').version

describe('buffered-request', function () {
  it('should export the right module version', function () {
    bufferedRequest.version.should.be.equal(version)
  })
  it('should patch IncomingMessage.prototype / http', function (done) {
    var server = http.createServer(function (request, response) {
      request.makeBuffered.should.be.instanceof(Function)
      response.end()
      server.close()
      done()
    })
    server.listen(8080, function () {
      httpreq('http://localhost:8080')
    })
  })
  it('should patch IncomingMessage.prototype / https', function (done) {
    var server = https.createServer({
      key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
      cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
    }, function (request, response) {
      request.makeBuffered.should.be.instanceof(Function)
      response.end()
      server.close()
      done()
    })
    server.listen(8080, function () {
      httpreq('https://localhost:8080')
    })
  })
  it('should buffer the request / pipe in', function (done) {
    var originalHash = crypto.createHash('sha1')
    var receivedHash = crypto.createHash('sha1')
    var server = http.createServer(function (request, response) {
      request.makeBuffered()
      request.pause()
      process.nextTick(function () {
        request.on('data', function (chunk) {
          receivedHash.update(chunk)
        })
      })
      var pauseInt = setInterval(function () { request.pause() }, 5000 * Math.random() + 3000)
      var resumeInt = setInterval(function () { request.resume() }, 1000 * Math.random() + 200)
      request.on('end', function () {
        clearInterval(pauseInt)
        clearInterval(resumeInt)
        response.writeHead(200)
        response.end()
        originalHash.digest('hex').should.be.eql(receivedHash.digest('hex'))
        server.close()
        done()
      })
    })
    server.listen(8080, function () {
      setTimeout(function () {
        httpreq.get('https://nodeload.github.com/LearnBoost/socket.io/zipball/master').on('data', function (chunk) {
          originalHash.update(chunk)
        }).pipe(http.request({ host: 'localhost', port: '8080', method: 'POST' }))
      }, 500)
    })
  })
  it('should buffer the request / pipe out', function (done) {
    var originalHash = crypto.createHash('sha1')
    var receivedHash = crypto.createHash('sha1')
    var zipfile = fs.createWriteStream('test.zip')
    var server = http.createServer(function (request, response) {
      request.makeBuffered()
      request.pause()
      process.nextTick(function () {
        request.pipe(zipfile)
      })
      var pauseInt = setInterval(function () { request.pause() }, 5000 * Math.random() + 3000)
      var resumeInt = setInterval(function () { request.resume() }, 1000 * Math.random() + 200)
      request.on('end', function () {
        clearInterval(pauseInt)
        clearInterval(resumeInt)
        response.writeHead(200)
        response.end()
        receivedHash.update(fs.readFileSync('test.zip'))
        originalHash.digest('hex').should.be.eql(receivedHash.digest('hex'))
        server.close()
        fs.unlinkSync('test.zip')
        done()
      })
    })
    server.listen(8080, function () {
      setTimeout(function () {
        httpreq.get('https://nodeload.github.com/LearnBoost/socket.io/zipball/master').on('data', function (chunk) {
          originalHash.update(chunk)
        }).pipe(http.request({ host: 'localhost', port: '8080', method: 'POST' }))
      }, 500)
    })
  })
  it('should buffer the request / pipe in-out', function (done) {
    var originalHash = crypto.createHash('sha1')
    var receivedHashPipe = crypto.createHash('sha1')
    var receivedHashData = crypto.createHash('sha1')
    var zipfile = fs.createWriteStream('test.zip')
    var server = http.createServer(function (request, response) {
      request.makeBuffered()
      request.pause()
      process.nextTick(function () {
        request.pipe(zipfile)
        request.on('data', function (chunk) {
          receivedHashData.update(chunk)
        })
      })
      var pauseInt = setInterval(function () { request.pause() }, 5000 * Math.random() + 3000)
      var resumeInt = setInterval(function () { request.resume() }, 1000 * Math.random() + 200)
      request.on('end', function () {
        clearInterval(pauseInt)
        clearInterval(resumeInt)
        response.writeHead(200)
        response.end()
        receivedHashPipe.update(fs.readFileSync('test.zip'))
        var digests = [
          originalHash.digest('hex'),
          receivedHashPipe.digest('hex'),
          receivedHashData.digest('hex')
        ]
        digests.forEach(function (hash) {
          digests.forEach(function (hashToMatch){
            hash.should.be.eql(hashToMatch)
          })
        })
        server.close()
        fs.unlinkSync('test.zip')
        done()
      })
    })
    server.listen(8080, function () {
      setTimeout(function () {
        httpreq.get('https://nodeload.github.com/LearnBoost/socket.io/zipball/master').on('data', function (chunk) {
          originalHash.update(chunk)
        }).pipe(http.request({ host: 'localhost', port: '8080', method: 'POST' }))
      }, 500)
    })
  })
})
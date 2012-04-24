require('http').IncomingMessage.prototype.makeBuffered = function () {
  var self = this
  var unluckyChunks = []
  var isPaused = false
  var isEnded = false
  var originalResume = self.resume
  var originalPause = self.pause
  var originalEmit = self.emit
  var currentEmit = originalEmit

  function patchedEmit(eventName, chunk) {
    if (eventName === 'data') {
      unluckyChunks.push(chunk)
    } else if (eventName === 'end') {
      isEnded = true
    } else {
      originalEmit.apply(self, arguments)
    }
  }

  self.resume = function () {
    if (!isPaused) return
    isPaused = false
    currentEmit = originalEmit
    if (unluckyChunks.length) {
      unluckyChunks.forEach(function (chunk) {
        self.emit('data', chunk)
      })
    }
    if (isEnded) {
      self.emit('end')
    }
    originalResume.apply(this, arguments)
  }

  self.pause = function () {
    if (isPaused) return
    isPaused = true
    unluckyChunks = []
    currentEmit = patchedEmit
    originalPause.apply(this, arguments)
  }

  self.emit = function () {
    currentEmit.apply(this, arguments)
  }
}

module.exports.version = require('../package').version
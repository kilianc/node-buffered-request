# buffered-request [![build status](https://secure.travis-ci.org/kilianc/node-buffered-request.png?branch=master)](http://travis-ci.org/kilianc/node-buffered-request)

__Hack/patch for the Request Object that makes it buffered.__

It solves the pause/resume unbuffered behaviorin node <= 0.6.x [related topic](https://groups.google.com/forum/?fromgroups#!topic/nodejs/pzhtOO6ePZ0)

The patch adds a `makeBuffered` method to the request object (who is `instanceof IncomingMessage`) and
doesn't break any functionality of the actual `IncomingMessage` Object. It still works well with `pipes` and `data` events.

Take a look ad the test suite for some example.

## Installation

    ⚡ npm install buffered-request

```javascript
require('buffered-request')
```

## Syntax

```javascript
IncomingMessage.makeBuffered()
```

## Example

```javascript
var server = http.createServer(function (request, response) {
  request.makeBuffered() // ensure that you will never lose packets
  request.pause()
  setTimeout(function () {
    request.on('data', function (chunk) {
      // data event will be emitted for all previous buffered chunks
    })
    request.resume()
  }, 1000)
  ...
}).listen(8080)
```

## Test

    ⚡ npm install
    ⚡ npm test

## Test Coverage

    ⚡ npm install -g jscoverage
    ⚡ make test-cov
    
## License

_This software is released under the MIT license cited below_.

    Copyright (c) 2010 Kilian Ciuffolo, me@nailik.org. All Rights Reserved.

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the 'Software'), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:
    
    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

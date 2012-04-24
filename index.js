module.exports = process.env.BUFFERED_REQUEST_COV
   ? require('./lib-cov/buffered-request')
   : require('./lib/buffered-request');
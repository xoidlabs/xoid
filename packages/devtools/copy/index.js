'use strict';

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./devtools.js').devtools
}
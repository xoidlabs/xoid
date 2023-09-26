'use strict';

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./devtools.js');
} else {
  module.exports = function () { return function () {}; };
}
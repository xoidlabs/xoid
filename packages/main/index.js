'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var C = require('@xoid/core');
var M = require('@xoid/model');
var x = Object.assign(M.model.bind({}), C, M);

function make(O) {
	Object.keys(O).forEach(function (k) {
		Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return O[k];
			}
		});
	});
}
make(C)
make(M)
exports.default = x;
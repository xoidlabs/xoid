'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var C = require('@xoid/core');
var M = require('@xoid/model');
var R = require('@xoid/ready');
var x = Object.assign(M.model.bind({}), C, M, R);

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
make(R)
exports.default = x;
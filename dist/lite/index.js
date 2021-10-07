'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var xoid = require('xoid');
var react = require('@xoid/react');



Object.keys(xoid).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return xoid[k];
		}
	});
});
Object.keys(react).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return react[k];
		}
	});
});

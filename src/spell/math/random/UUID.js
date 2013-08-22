/**
 * UUID.core.js: The minimal subset of the RFC-compliant UUID generator UUID.js.
 *
 * author:  LiosK
 * version: core-1.0
 * license: The MIT License: Copyright (c) 2012 LiosK.
 *
 * @private
 */
define(
	'spell/math/random/UUID',
	function() {
		'use strict'


		/**
		 * Returns an unsigned x-bit random integer (0 <= f(x) < 2^x).
		 *
		 * @private
		 * @param {Number} x A positive integer ranging from 0 to 53, inclusive.
		 * @returns {Number}
		 */
		var getRandomInt = function(x) {
			if (x <   0) return NaN;
			if (x <= 30) return (0 | Math.random() * (1 <<      x));
			if (x <= 53) return (0 | Math.random() * (1 <<     30))
				+ (0 | Math.random() * (1 << x - 30)) * (1 << 30);
			return NaN;
		};

		/**
		 * Converts an integer to a zero-filled hexadecimal string.
		 *
		 * @private
		 * @param {Number} num
		 * @param {Number} length
		 * @returns {String}
		 */
		var hex = function(num, length) {
			var str = num.toString(16), i = length - str.length, z = "0";
			for (; i > 0; i >>>= 1, z += z) { if (i & 1) { str = z + str; } }
			return str;
		};


		/**
		 * Enables the generation of UUIDs. See http://en.wikipedia.org/wiki/Universally_unique_identifier.
		 *
		 * @class spell.math.random.UUID
		 * @constructor
		 */
		var UUID = function() {}

		/**
		 * Generates an UUID string.
		 *
		 * @returns {String}
		 */
		UUID.generate = function() {
			return  hex(getRandomInt(32), 8)        // time_low
				+ "-"
				+ hex(getRandomInt(16), 4)          // time_mid
				+ "-"
				+ hex(0x4000 | getRandomInt(12), 4) // time_hi_and_version
				+ "-"
				+ hex(0x8000 | getRandomInt(14), 4) // clock_seq_hi_and_reserved clock_seq_low
				+ "-"
				+ hex(getRandomInt(48), 12);        // node
		};

		return UUID
	}
)

/*
 * This class is derived from glmatrix 1.3.7. Original Licence follows:
 *
 * Copyright (c) 2012 Brandon Jones, Colin MacKenzie IV
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 *
 * 2. Altered source versions must be plainly marked as such, and must not
 * be misrepresented as being the original software.
 *
 * 3. This notice may not be removed or altered from any source
 * distribution.
 */

/**
 * **This class implements high performance 4 dimensional vector math.**
 *
 * Example usage:
 *
 *     var vecA = vec2.{@link #createFrom}(1, 2, 3, 4);
 *     //=> vecA is now a Float32Array with [1,2,3,4]
 *
 *     var vecB = vec2.{@link #create}([3, 4, 5, 6]);
 *     //=> vecB is now a Float32Array with [3,4,5,6], The original array has been converted to a Float32Array.
 *
 *     var vecC = vec2.{@link #add}(vecA, vecB);
 *     //=> vecB = vecC is now [4, 6, 8, 10]. VecB has been overriden because we provided no destination vector as third argument..
 *
 *     var vecD = vec2.{@link #create}();
 *     //=> Allocate a new empty Float32Array with [0, 0, 0, 0]
 *
 *     var vecD = vec2.{@link #add}(vecA, vecB, vecD);
 *     //=> vecA and vecB are not touched, the result is written in vecD = [5,8,11,14]
 *
 * Please note: This object does not hold the vector components itself, it defines helper functions which manipulate
 * highly optimized data structures. This is done for performance reasons. **You need to allocate new vectors
 * with the {@link #create} or {@link #createFrom} function. Don't try to allocate new vectors yourself, always use
 * these function to do so.**
 *
 * *This class is derived from [glMatrix](https://github.com/toji/gl-matrix) 1.3.7 originally written by Brandon Jones
 * and Colin MacKenzie IV. The original BSD licence is included in the source file of this class.*
 *
 * @class spell.math.vec4
 * @singleton
 * @requires Math
 * @requires spell.shared.util.platform.Types
 */
define(
	"spell/math/vec3",
	[
		"spell/shared/util/platform/Types"
	],
	function (Types) {

		"use strict";
		var createFloatArray = Types.createFloatArray;

		// Tweak to your liking
		var FLOAT_EPSILON = 0.000001;

		var vec4 = {};

		/**
		 * Creates a new 4d-vector, initializing it from vec if vec
		 * is given.
		 *
		 * @param {Array} [vec] the vector's initial contents
		 * @returns {Float32Array} a new 4d-vector
		 */
		vec4.create = function (vec) {
			var dest = createFloatArray(4);

			if (vec) {
				dest[0] = vec[0];
				dest[1] = vec[1];
				dest[2] = vec[2];
				dest[3] = vec[3];
			} else {
				dest[0] = 0;
				dest[1] = 0;
				dest[2] = 0;
				dest[3] = 0;
			}
			return dest;
		};

		/**
		 * Creates a new instance of a 4d-vector, initializing it with the given arguments
		 *
		 * @param {number} x X value
		 * @param {number} y Y value
		 * @param {number} z Z value
		 * @param {number} w W value
		 * @returns {Float32Array} New 4d-vector
		 */
		vec4.createFrom = function (x, y, z, w) {
			var dest = createFloatArray(4);

			dest[0] = x;
			dest[1] = y;
			dest[2] = z;
			dest[3] = w;

			return dest;
		};

		/**
		 * Adds the 4d-vector's together. If dest is given, the result
		 * is stored there. Otherwise, the result is stored in vecB.
		 *
		 * @param {Float32Array} vecA the first 4d-vector
		 * @param {Float32Array} vecB the second 4d-vector
		 * @param {Float32Array} [dest] the optional receiving 4d-vector
		 * @returns {Float32Array} dest 4d-vector
		 */
		vec4.add = function (vecA, vecB, dest) {
			if (!dest) dest = vecB;
			dest[0] = vecA[0] + vecB[0];
			dest[1] = vecA[1] + vecB[1];
			dest[2] = vecA[2] + vecB[2];
			dest[3] = vecA[3] + vecB[3];
			return dest;
		};

		/**
		 * Subtracts vecB from vecA. If dest is given, the result
		 * is stored there. Otherwise, the result is stored in vecB.
		 *
		 * @param {Float32Array} vecA the first 4d-vector
		 * @param {Float32Array} vecB the second 4d-vector
		 * @param {Float32Array} [dest] the optional receiving 4d-vector
		 * @returns {Float32Array} dest 4d-vector
		 */
		vec4.subtract = function (vecA, vecB, dest) {
			if (!dest) dest = vecB;
			dest[0] = vecA[0] - vecB[0];
			dest[1] = vecA[1] - vecB[1];
			dest[2] = vecA[2] - vecB[2];
			dest[3] = vecA[3] - vecB[3];
			return dest;
		};

		/**
		 * Multiplies vecA with vecB. If dest is given, the result
		 * is stored there. Otherwise, the result is stored in vecB.
		 *
		 * @param {Float32Array} vecA the first 4d-vector
		 * @param {Float32Array} vecB the second 4d-vector
		 * @param {Float32Array} [dest] the optional receiving 4d-vector
		 * @returns {Float32Array} dest 4d-vector
		 */
		vec4.multiply = function (vecA, vecB, dest) {
			if (!dest) dest = vecB;
			dest[0] = vecA[0] * vecB[0];
			dest[1] = vecA[1] * vecB[1];
			dest[2] = vecA[2] * vecB[2];
			dest[3] = vecA[3] * vecB[3];
			return dest;
		};

		/**
		 * Divides vecA by vecB. If dest is given, the result
		 * is stored there. Otherwise, the result is stored in vecB.
		 *
		 * @param {Float32Array} vecA the first 4d-vector
		 * @param {Float32Array} vecB the second 4d-vector
		 * @param {Float32Array} [dest] the optional receiving 4d-vector
		 * @returns {Float32Array} dest 4d-vector
		 */
		vec4.divide = function (vecA, vecB, dest) {
			if (!dest) dest = vecB;
			dest[0] = vecA[0] / vecB[0];
			dest[1] = vecA[1] / vecB[1];
			dest[2] = vecA[2] / vecB[2];
			dest[3] = vecA[3] / vecB[3];
			return dest;
		};

		/**
		 * Scales vecA by some scalar number. If dest is given, the result
		 * is stored there. Otherwise, the result is stored in vecA.
		 *
		 * This is the same as multiplying each component of vecA
		 * by the given scalar.
		 *
		 * @param {Float32Array} vecA the vector to be scaled
		 * @param {Number} scalar the amount to scale the vector by
		 * @param {Float32Array} [dest] the optional receiving vector
		 * @returns {Float32Array} dest
		 */
		vec4.scale = function (vecA, scalar, dest) {
			if (!dest) dest = vecA;
			dest[0] = vecA[0] * scalar;
			dest[1] = vecA[1] * scalar;
			dest[2] = vecA[2] * scalar;
			dest[3] = vecA[3] * scalar;
			return dest;
		};

		/**
		 * Copies the values of one 4d-vector to another
		 *
		 * @param {Float32Array} vec 4d-vector containing values to copy
		 * @param {Float32Array} dest 4d-vector receiving copied values
		 *
		 * @returns {Float32Array} dest
		 */
		vec4.set = function (vec, dest) {
			dest[0] = vec[0];
			dest[1] = vec[1];
			dest[2] = vec[2];
			dest[3] = vec[3];
			return dest;
		};

		/**
		 * Compares two vectors for equality within a certain margin of error
		 *
		 * @param {Float32Array} a First 4d-vector
		 * @param {Float32Array} b Second 4d-vector
		 *
		 * @returns {Boolean} True if a is equivalent to b
		 */
		vec4.equal = function (a, b) {
			return a === b || (
				Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
					Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
					Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
					Math.abs(a[3] - b[3]) < FLOAT_EPSILON
				);
		};

		/**
		 * Negates the components of a 4d-vector
		 *
		 * @param {Float32Array} vec 4d-vector to negate
		 * @param {Float32Array} [dest] 4d-vector receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec4.negate = function (vec, dest) {
			if (!dest) {
				dest = vec;
			}
			dest[0] = -vec[0];
			dest[1] = -vec[1];
			dest[2] = -vec[2];
			dest[3] = -vec[3];
			return dest;
		};

		/**
		 * Caclulates the length of a 4d-vector
		 *
		 * @param {Float32Array} vec 4d-vector to calculate length of
		 *
		 * @returns {Number} Length of 4d-vector
		 */
		vec4.length = function (vec) {
			var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
			return Math.sqrt(x * x + y * y + z * z + w * w);
		};

		/**
		 * Caclulates the squared length of a 4d-vector
		 *
		 * @param {Float32Array} vec 4d-vector to calculate squared length of
		 *
		 * @returns {Number} Squared Length of 4d-vector
		 */
		vec4.squaredLength = function (vec) {
			var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
			return x * x + y * y + z * z + w * w;
		};

		/**
		 * Performs a linear interpolation between two 4d-vector
		 *
		 * @param {Float32Array} vecA First 4d-vector
		 * @param {Float32Array} vecB Second 4d-vector
		 * @param {Number} lerp Interpolation amount between the two inputs
		 * @param {Float32Array} [dest] 4d-vector receiving operation result. If not specified result is written to vecA
		 *
		 * @returns {Float32Array} dest if specified, vecA otherwise
		 */
		vec4.lerp = function (vecA, vecB, lerp, dest) {
			if (!dest) {
				dest = vecA;
			}
			dest[0] = vecA[0] + lerp * (vecB[0] - vecA[0]);
			dest[1] = vecA[1] + lerp * (vecB[1] - vecA[1]);
			dest[2] = vecA[2] + lerp * (vecB[2] - vecA[2]);
			dest[3] = vecA[3] + lerp * (vecB[3] - vecA[3]);
			return dest;
		};

		/**
		 * Returns a string representation of a 4d-vector
		 *
		 * @param {Float32Array} vec 4d-vector to represent as a string
		 *
		 * @returns {String} String representation of 4d-vector
		 */
		vec4.str = function (vec) {
			return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ', ' + vec[3] + ']';
		};


		return vec4;
	})
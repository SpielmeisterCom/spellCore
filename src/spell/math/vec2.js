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
 * **This class implements high performance 2 dimensional vector math.**
 *
 * Example usage:
 *
 *     var vecA = vec2.{@link #createFrom}(1, 2);
 *     //=> vecA is now a Float32Array with [1,2]
 *
 *     var vecB = vec2.{@link #create}([3, 4]);
 *     //=> vecB is now a Float32Array with [3,4], The original array has been converted to a Float32Array.
 *
 *     var vecC = vec2.{@link #add}(vecA, vecB);
 *     //=> vecB = vecC is now [4, 6]. VecB has been overriden because we provided no destination vector as third argument..
 *
 *     var vecD = vec2.{@link #create}();
 *     //=> Allocate a new empty Float32Array with [0, 0]
 *
 *     var vecD = vec2.{@link #add}(vecA, vecB, vecD);
 *     //=> vecA and vecB are not touched, the result is written in vecD = [5, 8]
 *
 *
 *     // you need to allocate a temporary vec2 if you want to chain vec2 operations
 *     var tmpVec2 = vec2.{@link #create}()
 *
 *     // the result of the scale operation is written to tmpVec2 and is being used
 *     // as second argument for vec2.{@link #subtract}, because vec2.{@link #scale} also returns tmpVec2
 *     // after that positionB - tmpVec2 is written to positionB
 *
 *     vec2.{@link #subtract}(
 *       positionB,
 *       vec2.{@link #scale}( positionA, 0.05, tmpVec2 ),
 *       positionB
 *     )
 *
 *     //=> result is positionB = positionB - scale(positionA, 0.05)
 *
 *
 * Please note: This object does not hold the vector components itself, it defines helper functions which manipulate
 * highly optimized data structures. This is done for performance reasons. **You need to allocate new vectors
 * with the {@link #create} or {@link #createFrom} function. Don't try to allocate new vectors yourself, always use
 * these function to do so.**
 *
 *
 * *This class is derived from [glMatrix](https://github.com/toji/gl-matrix) 1.3.7 originally written by Brandon Jones
 * and Colin MacKenzie IV. The original BSD licence is included in the source file of this class.*
 *
 * @class spell.math.vec2
 * @singleton
 * @requires Math
 * @requires spell.shared.util.platform.Types
 */
define(
	"spell/math/vec2",
	["spell/shared/util/platform/Types"],
	function (Types) {
		"use strict"

		var createFloatArray = Types.createFloatArray;

		// Tweak to your liking
		var FLOAT_EPSILON = 0.000001;

		var vec2 = {};

		/**
		 * Creates a new vec2, initializing it from vec if vec
		 * is given.
		 *
		 * @param {Array} [vec] Array-like datascructure with the vector's initial contents
		 * @returns {Float32Array} a new 2D vector
		 */
		vec2.create = function (vec) {
			var dest = createFloatArray(2);

			if (vec) {
				dest[0] = vec[0];
				dest[1] = vec[1];
			} else {
				dest[0] = 0;
				dest[1] = 0;
			}
			return dest;
		};

		/**
		 * Creates a new instance of a vec2, initializing it with the given arguments
		 *
		 * @param {number} x X value
		 * @param {number} y Y value

		 * @returns {Float32Array} New vec2
		 */
		vec2.createFrom = function (x, y) {
			var dest = createFloatArray(2);

			dest[0] = x;
			dest[1] = y;

			return dest;
		};

		/**
		 * Adds the vec2's together. If dest is given, the result
		 * is stored there. Otherwise, the result is stored in vecB.
		 *
		 * @param {Float32Array} vecA the first operand
		 * @param {Float32Array} vecB the second operand
		 * @param {Float32Array} [dest] the optional receiving vector
		 * @returns {Float32Array} dest
		 */
		vec2.add = function (vecA, vecB, dest) {
			if (!dest) dest = vecB;
			dest[0] = vecA[0] + vecB[0];
			dest[1] = vecA[1] + vecB[1];
			return dest;
		};

		/**
		 * Subtracts vecB from vecA. If dest is given, the result
		 * is stored there. Otherwise, the result is stored in vecB.
		 *
		 * @param {Float32Array} vecA the first operand
		 * @param {Float32Array} vecB the second operand
		 * @param {Float32Array} [dest] the optional receiving vector
		 * @returns {Float32Array} dest
		 */
		vec2.subtract = function (vecA, vecB, dest) {
			if (!dest) dest = vecB;
			dest[0] = vecA[0] - vecB[0];
			dest[1] = vecA[1] - vecB[1];
			return dest;
		};

		/**
		 * Multiplies vecA with vecB. If dest is given, the result
		 * is stored there. Otherwise, the result is stored in vecB.
		 *
		 * @param {Float32Array} vecA the first operand
		 * @param {Float32Array} vecB the second operand
		 * @param {Float32Array} [dest] the optional receiving vector
		 * @returns {Float32Array} dest
		 */
		vec2.multiply = function (vecA, vecB, dest) {
			if (!dest) dest = vecB;
			dest[0] = vecA[0] * vecB[0];
			dest[1] = vecA[1] * vecB[1];
			return dest;
		};

		/**
		 * Divides vecA by vecB. If dest is given, the result
		 * is stored there. Otherwise, the result is stored in vecB.
		 *
		 * @param {Float32Array} vecA the first operand
		 * @param {Float32Array} vecB the second operand
		 * @param {Float32Array} [dest] the optional receiving vector
		 * @returns {Float32Array} dest
		 */
		vec2.divide = function (vecA, vecB, dest) {
			if (!dest) dest = vecB;
			dest[0] = vecA[0] / vecB[0];
			dest[1] = vecA[1] / vecB[1];
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
		 * @param {number} scalar the amount to scale the vector by
		 * @param {Float32Array} [dest] the optional receiving vector
		 * @returns {Float32Array} dest
		 */
		vec2.scale = function (vecA, scalar, dest) {
			if (!dest) dest = vecA;
			dest[0] = vecA[0] * scalar;
			dest[1] = vecA[1] * scalar;
			return dest;
		};

		/**
		 * Calculates the euclidian distance between two vec2
		 *
		 * Params:
		 * @param {Float32Array} vecA First vector
		 * @param {Float32Array} vecB Second vector
		 *
		 * @returns {number} Distance between vecA and vecB
		 */
		vec2.dist = function (vecA, vecB) {
			var x = vecB[0] - vecA[0],
				y = vecB[1] - vecA[1];
			return Math.sqrt(x * x + y * y);
		};

		/**
		 * Copies the values of one vec2 to another
		 *
		 * @param {Float32Array} vec vec2 containing values to copy
		 * @param {Float32Array} dest vec2 receiving copied values
		 *
		 * @returns {Float32Array} dest
		 */
		vec2.set = function (vec, dest) {
			dest[0] = vec[0];
			dest[1] = vec[1];
			return dest;
		};

		/**
		 * Compares two vectors for equality within a certain margin of error
		 *
		 * @param {Float32Array} a First vector
		 * @param {Float32Array} b Second vector
		 *
		 * @returns {Boolean} True if a is equivalent to b
		 */
		vec2.equal = function (a, b) {
			return a === b || (
				Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
					Math.abs(a[1] - b[1]) < FLOAT_EPSILON
				);
		};

		/**
		 * Negates the components of a vec2
		 *
		 * @param {Float32Array} vec vec2 to negate
		 * @param {Float32Array} [dest] vec2 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec2.negate = function (vec, dest) {
			if (!dest) {
				dest = vec;
			}
			dest[0] = -vec[0];
			dest[1] = -vec[1];
			return dest;
		};

		/**
		 * Normlize a vec2
		 *
		 * @param {Float32Array} vec vec2 to normalize
		 * @param {Float32Array} [dest] vec2 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec2.normalize = function (vec, dest) {
			if (!dest) {
				dest = vec;
			}
			var mag = vec[0] * vec[0] + vec[1] * vec[1];
			if (mag > 0) {
				mag = Math.sqrt(mag);
				dest[0] = vec[0] / mag;
				dest[1] = vec[1] / mag;
			} else {
				dest[0] = dest[1] = 0;
			}
			return dest;
		};

		/**
		 * Computes the cross product of two vec2's. Note that the cross product must by definition
		 * produce a 3D vector. If a dest vector is given, it will contain the resultant 3D vector.
		 * Otherwise, a scalar number will be returned, representing the vector's Z coordinate, since
		 * its X and Y must always equal 0.
		 *
		 * Examples:
		 *     var crossResult = vec3.create();
		 *     vec2.cross([1, 2], [3, 4], crossResult);
		 *     //=> [0, 0, -2]
		 *
		 *     vec2.cross([1, 2], [3, 4]);
		 *     //=> -2
		 *
		 * See [this page](http://stackoverflow.com/questions/243945/calculating-a-2d-vectors-cross-product)
		 * for some interesting facts.
		 *
		 * @param {Float32Array} vecA left operand
		 * @param {Float32Array} vecB right operand
		 * @param {Float32Array} [dest] optional vec2 receiving result. If not specified a scalar is returned
		 *
		 */
		vec2.cross = function (vecA, vecB, dest) {
			var z = vecA[0] * vecB[1] - vecA[1] * vecB[0];
			if (!dest) return z;
			dest[0] = dest[1] = 0;
			dest[2] = z;
			return dest;
		};

		/**
		 * Caclulates the length of a vec2
		 *
		 * @param {Float32Array} vec vec2 to calculate length of
		 *
		 * @returns {Number} Length of vec
		 */
		vec2.length = function (vec) {
			var x = vec[0], y = vec[1];
			return Math.sqrt(x * x + y * y);
		};

		/**
		 * Caclulates the squared length of a vec2
		 *
		 * @param {Float32Array} vec vec2 to calculate squared length of
		 *
		 * @returns {Number} Squared Length of vec
		 */
		vec2.squaredLength = function (vec) {
			var x = vec[0], y = vec[1];
			return x * x + y * y;
		};

		/**
		 * Caclulates the dot product of two vec2s
		 *
		 * @param {Float32Array} vecA First operand
		 * @param {Float32Array} vecB Second operand
		 *
		 * @returns {Number} Dot product of vecA and vecB
		 */
		vec2.dot = function (vecA, vecB) {
			return vecA[0] * vecB[0] + vecA[1] * vecB[1];
		};

		/**
		 * Generates a 2D unit vector pointing from one vector to another
		 *
		 * @param {Float32Array} vecA Origin vec2
		 * @param {Float32Array} vecB vec2 to point to
		 * @param {Float32Array} [dest] vec2 receiving operation result. If not specified result is written to vecA
		 *
		 * @returns {Float32Array} dest if specified, vecA otherwise
		 */
		vec2.direction = function (vecA, vecB, dest) {
			if (!dest) {
				dest = vecA;
			}

			var x = vecA[0] - vecB[0],
				y = vecA[1] - vecB[1],
				len = x * x + y * y;

			if (!len) {
				dest[0] = 0;
				dest[1] = 0;
				dest[2] = 0;
				return dest;
			}

			len = 1 / Math.sqrt(len);
			dest[0] = x * len;
			dest[1] = y * len;
			return dest;
		};

		/**
		 * Performs a linear interpolation between two vec2
		 *
		 * @param {Float32Array} vecA First vector
		 * @param {Float32Array} vecB Second vector
		 * @param {Number} lerp Interpolation amount between the two inputs
		 * @param {Float32Array} [dest] vec2 receiving operation result. If not specified result is written to vecA
		 *
		 * @returns {Float32Array} dest if specified, vecA otherwise
		 */
		vec2.lerp = function (vecA, vecB, lerp, dest) {
			if (!dest) {
				dest = vecA;
			}
			dest[0] = vecA[0] + lerp * (vecB[0] - vecA[0]);
			dest[1] = vecA[1] + lerp * (vecB[1] - vecA[1]);
			return dest;
		};

		/**
		 * Returns a string representation of a vector
		 *
		 * @param {Float32Array} vec Vector to represent as a string
		 *
		 * @returns {String} String representation of vec
		 */
		vec2.str = function (vec) {
			return '[' + vec[0] + ', ' + vec[1] + ']';
		};


		return vec2;
	}
)

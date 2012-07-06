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
 * **This class implements high performance 3 dimensional vector math.**
 *
 * Example usage:
 *
 *     var vecA = vec2.{@link #createFrom}(1, 2, 3);
 *     //=> vecA is now a Float32Array with [1,2,3]
 *
 *     var vecB = vec2.{@link #create}([3, 4, 5]);
 *     //=> vecB is now a Float32Array with [3,4,5], The original array has been converted to a Float32Array.
 *
 *     var vecC = vec2.{@link #add}(vecA, vecB);
 *     //=> vecB = vecC is now [4, 6, 8]. VecB has been overriden because we provided no destination vector as third argument..
 *
 *     var vecD = vec2.{@link #create}();
 *     //=> Allocate a new empty Float32Array with [0, 0, 0]
 *
 *     var vecD = vec2.{@link #add}(vecA, vecB, vecD);
 *     //=> vecA and vecB are not touched, the result is written in vecD = [5,8,11]
 *
 * Please note: This object does not hold the vector components itself, it defines helper functions which manipulate
 * highly optimized data structures. This is done for performance reasons. **You need to allocate new vectors
 * with the {@link #create} or {@link #createFrom} function. Don't try to allocate new vectors yourself, always use
 * these function to do so.**
 *
 * *This class is derived from [glMatrix](https://github.com/toji/gl-matrix) 1.3.7 originally written by Brandon Jones
 * and Colin MacKenzie IV. The original BSD licence is included in the source file of this class.*
 *
 * @class spell.math.vec3
 * @singleton
 * @requires Math
 * @requires spell.shared.util.platform.Types
 * @requires spell.math.quat4
 */
define(
	"spell/math/vec3",
	[
		"spell/shared/util/platform/Types",
		"spell/math/quat4",
		"spell/math/mat4"
	],
	function(
		Types,
		quat4,
		mat4
	) {

		"use strict";
		var createFloatArray = Types.createFloatArray;

		// Tweak to your liking
		var FLOAT_EPSILON = 0.000001;

		var vec3 = {};

		/**
		 * Creates a new instance of a vec3 using the default array type
		 * Any javascript array-like objects containing at least 3 numeric elements can serve as a vec3
		 *
		 * @param {Array} [vec3] vec3 containing values to initialize with
		 *
		 * @returns {Float32Array} New vec3
		 */
		vec3.create = function (vec) {
			var dest = createFloatArray(3);

			if (vec) {
				dest[0] = vec[0];
				dest[1] = vec[1];
				dest[2] = vec[2];
			} else {
				dest[0] = dest[1] = dest[2] = 0;
			}

			return dest;
		};

		/**
		 * Creates a new instance of a vec3, initializing it with the given arguments
		 *
		 * @param {number} x X value
		 * @param {number} y Y value
		 * @param {number} z Z value

		 * @returns {Float32Array} New vec3
		 */
		vec3.createFrom = function (x, y, z) {
			var dest = createFloatArray(3);

			dest[0] = x;
			dest[1] = y;
			dest[2] = z;

			return dest;
		};

		/**
		 * Copies the values of one vec3 to another
		 *
		 * @param {Float32Array} vec vec3 containing values to copy
		 * @param {Float32Array} dest vec3 receiving copied values
		 *
		 * @returns {Float32Array} dest
		 */
		vec3.set = function (vec, dest) {
			dest[0] = vec[0];
			dest[1] = vec[1];
			dest[2] = vec[2];

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
		vec3.equal = function (a, b) {
			return a === b || (
				Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
					Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
					Math.abs(a[2] - b[2]) < FLOAT_EPSILON
				);
		};

		/**
		 * Performs a vector addition
		 *
		 * @param {Float32Array} vec First operand
		 * @param {Float32Array} vec2 Second operand
		 * @param {Float32Array} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.add = function (vec, vec2, dest) {
			if (!dest || vec === dest) {
				vec[0] += vec2[0];
				vec[1] += vec2[1];
				vec[2] += vec2[2];
				return vec;
			}

			dest[0] = vec[0] + vec2[0];
			dest[1] = vec[1] + vec2[1];
			dest[2] = vec[2] + vec2[2];
			return dest;
		};

		/**
		 * Performs a vector subtraction
		 *
		 * @param {Float32Array} vec First operand
		 * @param {Float32Array} vec2 Second operand
		 * @param {Float32Array} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.subtract = function (vec, vec2, dest) {
			if (!dest || vec === dest) {
				vec[0] -= vec2[0];
				vec[1] -= vec2[1];
				vec[2] -= vec2[2];
				return vec;
			}

			dest[0] = vec[0] - vec2[0];
			dest[1] = vec[1] - vec2[1];
			dest[2] = vec[2] - vec2[2];
			return dest;
		};

		/**
		 * Performs a vector multiplication
		 *
		 * @param {Float32Array} vec First operand
		 * @param {Float32Array} vec2 Second operand
		 * @param {Float32Array} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.multiply = function (vec, vec2, dest) {
			if (!dest || vec === dest) {
				vec[0] *= vec2[0];
				vec[1] *= vec2[1];
				vec[2] *= vec2[2];
				return vec;
			}

			dest[0] = vec[0] * vec2[0];
			dest[1] = vec[1] * vec2[1];
			dest[2] = vec[2] * vec2[2];
			return dest;
		};

		/**
		 * Negates the components of a vec3
		 *
		 * @param {Float32Array} vec vec3 to negate
		 * @param {Float32Array} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.negate = function (vec, dest) {
			if (!dest) {
				dest = vec;
			}

			dest[0] = -vec[0];
			dest[1] = -vec[1];
			dest[2] = -vec[2];
			return dest;
		};

		/**
		 * Multiplies the components of a vec3 by a scalar value
		 *
		 * @param {Float32Array} vec vec3 to scale
		 * @param {number} val Value to scale by
		 * @param {Float32Array} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.scale = function (vec, val, dest) {
			if (!dest || vec === dest) {
				vec[0] *= val;
				vec[1] *= val;
				vec[2] *= val;
				return vec;
			}

			dest[0] = vec[0] * val;
			dest[1] = vec[1] * val;
			dest[2] = vec[2] * val;
			return dest;
		};

		/**
		 * Generates a unit vector of the same direction as the provided vec3
		 * If vector length is 0, returns [0, 0, 0]
		 *
		 * @param {Float32Array} vec vec3 to normalize
		 * @param {Float32Array} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.normalize = function (vec, dest) {
			if (!dest) {
				dest = vec;
			}

			var x = vec[0], y = vec[1], z = vec[2],
				len = Math.sqrt(x * x + y * y + z * z);

			if (!len) {
				dest[0] = 0;
				dest[1] = 0;
				dest[2] = 0;
				return dest;
			} else if (len === 1) {
				dest[0] = x;
				dest[1] = y;
				dest[2] = z;
				return dest;
			}

			len = 1 / len;
			dest[0] = x * len;
			dest[1] = y * len;
			dest[2] = z * len;
			return dest;
		};

		/**
		 * Generates the cross product of two vec3s
		 *
		 * @param {Float32Array} vec First operand
		 * @param {Float32Array} vec2 Second operand
		 * @param {Float32Array} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.cross = function (vec, vec2, dest) {
			if (!dest) {
				dest = vec;
			}

			var x = vec[0], y = vec[1], z = vec[2],
				x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];

			dest[0] = y * z2 - z * y2;
			dest[1] = z * x2 - x * z2;
			dest[2] = x * y2 - y * x2;
			return dest;
		};

		/**
		 * Caclulates the length of a vec3
		 *
		 * @param {Float32Array} vec vec3 to calculate length of
		 *
		 * @returns {number} Length of vec
		 */
		vec3.length = function (vec) {
			var x = vec[0], y = vec[1], z = vec[2];
			return Math.sqrt(x * x + y * y + z * z);
		};

		/**
		 * Caclulates the squared length of a vec3
		 *
		 * @param {Float32Array} vec vec3 to calculate squared length of
		 *
		 * @returns {number} Squared Length of vec
		 */
		vec3.squaredLength = function (vec) {
			var x = vec[0], y = vec[1], z = vec[2];
			return x * x + y * y + z * z;
		};

		/**
		 * Caclulates the dot product of two vec3s
		 *
		 * @param {Float32Array} vec First operand
		 * @param {Float32Array} vec2 Second operand
		 *
		 * @returns {number} Dot product of vec and vec2
		 */
		vec3.dot = function (vec, vec2) {
			return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
		};

		/**
		 * Generates a unit vector pointing from one vector to another
		 *
		 * @param {Float32Array} vec Origin vec3
		 * @param {Float32Array} vec2 vec3 to point to
		 * @param {Float32Array} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.direction = function (vec, vec2, dest) {
			if (!dest) {
				dest = vec;
			}

			var x = vec[0] - vec2[0],
				y = vec[1] - vec2[1],
				z = vec[2] - vec2[2],
				len = Math.sqrt(x * x + y * y + z * z);

			if (!len) {
				dest[0] = 0;
				dest[1] = 0;
				dest[2] = 0;
				return dest;
			}

			len = 1 / len;
			dest[0] = x * len;
			dest[1] = y * len;
			dest[2] = z * len;
			return dest;
		};

		/**
		 * Performs a linear interpolation between two vec3
		 *
		 * @param {Float32Array} vec3_a First vector
		 * @param {Float32Array} vec3_b Second vector
		 * @param {Number} lerp Interpolation amount between the two inputs
		 * @param {Float32Array} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.lerp = function (vec, vec2, lerp, dest) {
			if (!dest) {
				dest = vec;
			}

			dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
			dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
			dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);

			return dest;
		};

		/**
		 * Calculates the euclidian distance between two vec3
		 *
		 * Params:
		 * @param {Float32Array} vec First vector
		 * @param {Float32Array} vec2 Second vector
		 *
		 * @returns {number} Distance between vec and vec2
		 */
		vec3.dist = function (vec, vec2) {
			var x = vec2[0] - vec[0],
				y = vec2[1] - vec[1],
				z = vec2[2] - vec[2];

			return Math.sqrt(x * x + y * y + z * z);
		};

		// Pre-allocated to prevent unecessary garbage collection
		var unprojectMat = null;
		var unprojectVec = createFloatArray(4);
		/**
		 * Projects the specified vec3 from screen space into object space
		 * Based on the [Mesa gluUnProject implementation](http://webcvs.freedesktop.org/mesa/Mesa/src/glu/mesa/project.c?revision=1.4&view=markup)
		 *
		 * @param {Float32Array} vec Screen-space vector to project
		 * @param {Float32Array} view mat4 View matrix
		 * @param {Float32Array} proj mat4 Projection matrix
		 * @param {Float32Array} viewport vec4 Viewport as given to gl.viewport [x, y, width, height]
		 * @param {Float32Array} [dest] vec3 receiving unprojected result. If not specified result is written to vec
		 *
		 * @returns {Float32Array} dest if specified, vec otherwise
		 */
		vec3.unproject = function (vec, view, proj, viewport, dest) {
			if (!dest) {
				dest = vec;
			}

			if (!unprojectMat) {
				unprojectMat = mat4.create();
			}

			var m = unprojectMat;
			var v = unprojectVec;

			v[0] = (vec[0] - viewport[0]) * 2.0 / viewport[2] - 1.0;
			v[1] = (vec[1] - viewport[1]) * 2.0 / viewport[3] - 1.0;
			v[2] = 2.0 * vec[2] - 1.0;
			v[3] = 1.0;

			mat4.multiply(proj, view, m);
			if (!mat4.inverse(m)) {
				return null;
			}

			mat4.multiplyVec4(m, v);
			if (v[3] === 0.0) {
				return null;
			}

			dest[0] = v[0] / v[3];
			dest[1] = v[1] / v[3];
			dest[2] = v[2] / v[3];

			return dest;
		};

		var xUnitVec3 = vec3.createFrom(1, 0, 0);
		var yUnitVec3 = vec3.createFrom(0, 1, 0);
		var zUnitVec3 = vec3.createFrom(0, 0, 1);

		var tmpvec3 = vec3.create();

		/**
		 * Generates a quaternion of rotation between two given normalized 3d-vectors
		 *
		 * @param {Float32Array} a Normalized source 3d-vector
		 * @param {Float32Array} b Normalized target 3d-vector
		 * @param {Float32Array} [dest] quat4 receiving operation result.
		 *
		 * @returns {Float32Array} dest if specified, a new quat4 otherwise
		 */
		vec3.rotationTo = function (a, b, dest) {
			if (!dest) {
				dest = quat4.create();
			}

			var d = vec3.dot(a, b);
			var axis = tmpvec3;
			if (d >= 1.0) {
				quat4.set(quat4.identity, dest);
			} else if (d < (0.000001 - 1.0)) {
				vec3.cross(xUnitVec3, a, axis);
				if (vec3.length(axis) < 0.000001)
					vec3.cross(yUnitVec3, a, axis);
				if (vec3.length(axis) < 0.000001)
					vec3.cross(zUnitVec3, a, axis);
				vec3.normalize(axis);
				quat4.fromAngleAxis(Math.PI, axis, dest);
			} else {
				var s = Math.sqrt((1.0 + d) * 2.0);
				var sInv = 1.0 / s;
				vec3.cross(a, b, axis);
				dest[0] = axis[0] * sInv;
				dest[1] = axis[1] * sInv;
				dest[2] = axis[2] * sInv;
				dest[3] = s * 0.5;
				quat4.normalize(dest);
			}
			if (dest[3] > 1.0) dest[3] = 1.0;
			else if (dest[3] < -1.0) dest[3] = -1.0;
			return dest;
		};

		/**
		 * Returns a string representation of a 3d-vector
		 *
		 * @param {Float32Array} vec3 3d-vector to represent as a string
		 *
		 * @returns {string} String representation of 3d-vector
		 */
		vec3.str = function (vec) {
			return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']';
		};

		return vec3
	}
)

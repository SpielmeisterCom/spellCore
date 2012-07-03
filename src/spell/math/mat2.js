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
 * **This class implements high performance 2x2 Matrix math.**
 *
 * Example usage:
 *
 *
 *     var matA = mat2.{@link #createFrom}(1, 2, 3, 4);
 *     //=> matA is now a Float32Array with [1,2,3,4]
 *
 *     var matB = mat2.{@link #create}([5, 6, 7, 8]);
 *     //=> matB is now a Float32Array with [5,6,7,8], The original array has been converted to a Float32Array.
 *
 *     var matC = mat2.{@link #create}();
 *     //=> matC is now [0,0,0,0]
 *
 *     // Multiply matA with matB and write the result to matC
 *     mat2.{@link #multiply}(matA, matB, matC);
 *
 *
 *
 * Please note: This object does not hold the matrix components itself, it defines helper functions which manipulate
 * highly optimized data structures. This is done for performance reasons. **You need to allocate new matrices
 * with the {@link #create} or {@link #createFrom} function. Don't try to allocate new matrices yourself, always use
 * these function to do so.**
 *
 *
 * *This class is derived from [glMatrix](https://github.com/toji/gl-matrix) 1.3.7 originally written by Brandon Jones
 * and Colin MacKenzie IV. The original BSD licence is included in the source file of this class.*
 *
 * @class spell.math.mat2
 * @singleton
 * @requires Math
 * @requires spell.shared.util.platform.Types
 */
define(
	"spell/math/mat2",
	["spell/shared/util/platform/Types"],
	function (Types) {

		"use strict";
		var createFloatArray = Types.createFloatArray;

		// Tweak to your liking
		var FLOAT_EPSILON = 0.000001;


		var mat2 = {};

		/**
		 * Creates a new 2x2-matrix. If src is given, the new matrix
		 * is initialized to those values.
		 *
		 * @param {Array} [src] the seed values for the new 2x2-matrix, if any
		 * @returns {Float32Array} a new 2x2-matrix
		 */
		mat2.create = function (src) {
			var dest = createFloatArray(4);

			if (src) {
				dest[0] = src[0];
				dest[1] = src[1];
				dest[2] = src[2];
				dest[3] = src[3];
			} else {
				dest[0] = dest[1] = dest[2] = dest[3] = 0;
			}
			return dest;
		};

		/**
		 * Creates a new instance of a 2x2-matrix, initializing it with the given arguments
		 *
		 * @param {number} m00
		 * @param {number} m01
		 * @param {number} m10
		 * @param {number} m11

		 * @returns {Float32Array} New 2x2-matrix
		 */
		mat2.createFrom = function (m00, m01, m10, m11) {
			var dest = createFloatArray(4);

			dest[0] = m00;
			dest[1] = m01;
			dest[2] = m10;
			dest[3] = m11;

			return dest;
		};

		/**
		 * Copies the values of one 2x2-matrix to another
		 *
		 * @param {Float32Array} mat 2x2-matrix containing values to copy
		 * @param {Float32Array} dest 2x2-matrix receiving copied values
		 *
		 * @returns {Float32Array} dest 2x2-matrix
		 */
		mat2.set = function (mat, dest) {
			dest[0] = mat[0];
			dest[1] = mat[1];
			dest[2] = mat[2];
			dest[3] = mat[3];
			return dest;
		};

		/**
		 * Compares two matrices for equality within a certain margin of error
		 *
		 * @param {Float32Array} a First 2x2-matrix
		 * @param {Float32Array} b Second 2x2-matrix
		 *
		 * @returns {Boolean} True if a is equivalent to b
		 */
		mat2.equal = function (a, b) {
			return a === b || (
				Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
					Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
					Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
					Math.abs(a[3] - b[3]) < FLOAT_EPSILON
				);
		};

		/**
		 * Sets a 2x2-matrix to an identity matrix
		 *
		 * @param {Float32Array} [dest] 2x2-matrix to set. If omitted a new one will be created.
		 *
		 * @returns {Float32Array} dest 2x2-matrix
		 */
		mat2.identity = function (dest) {
			if (!dest) {
				dest = mat2.create();
			}
			dest[0] = 1;
			dest[1] = 0;
			dest[2] = 0;
			dest[3] = 1;
			return dest;
		};

		/**
		 * Transposes a 2x2-matrix (flips the values over the diagonal)
		 *
		 * @param {Float32Array} mat 2x2-matrix to transpose
		 * @param {Float32Array} [dest] 2x2-matrix receiving transposed values. If not specified result is written to mat
		 *
		 * @return {Float32Array} dest if specified, mat otherwise
		 */
		mat2.transpose = function (mat, dest) {
			// If we are transposing ourselves we can skip a few steps but have to cache some values
			if (!dest || mat === dest) {
				var a00 = mat[1];
				mat[1] = mat[2];
				mat[2] = a00;
				return mat;
			}

			dest[0] = mat[0];
			dest[1] = mat[2];
			dest[2] = mat[1];
			dest[3] = mat[3];
			return dest;
		};

		/**
		 * Calculates the determinant of a 2x2-matrix
		 *
		 * @param {Float32Array} mat 2x2-matrix to calculate determinant of
		 *
		 * @returns {Number} determinant of mat
		 */
		mat2.determinant = function (mat) {
			return mat[0] * mat[3] - mat[2] * mat[1];
		};

		/**
		 * Calculates the inverse matrix of a 2x2-matrix
		 *
		 * @param {Float32Array} mat 2x2-matrix to calculate inverse of
		 * @param {Float32Array} [dest] 2x2-matrix receiving inverse matrix. If not specified result is written to mat
		 *
		 * @returns {Float32Array} dest is specified, mat otherwise, null if matrix cannot be inverted
		 */
		mat2.inverse = function (mat, dest) {
			if (!dest) {
				dest = mat;
			}
			var a0 = mat[0], a1 = mat[1], a2 = mat[2], a3 = mat[3];
			var det = a0 * a3 - a2 * a1;
			if (!det) return null;

			det = 1.0 / det;
			dest[0] = a3 * det;
			dest[1] = -a1 * det;
			dest[2] = -a2 * det;
			dest[3] = a0 * det;
			return dest;
		};

		/**
		 * Performs a matrix multiplication
		 *
		 * @param {Float32Array} matA 2x2-matrix First operand
		 * @param {Float32Array} matB 2x2-matrix Second operand
		 * @param {Float32Array} [dest] 2x2-matrix receiving operation result. If not specified result is written to matA
		 *
		 * @returns {Float32Array} dest if specified, matA otherwise
		 */
		mat2.multiply = function (matA, matB, dest) {
			if (!dest) {
				dest = matA;
			}
			var a11 = matA[0],
				a12 = matA[1],
				a21 = matA[2],
				a22 = matA[3];
			dest[0] = a11 * matB[0] + a12 * matB[2];
			dest[1] = a11 * matB[1] + a12 * matB[3];
			dest[2] = a21 * matB[0] + a22 * matB[2];
			dest[3] = a21 * matB[1] + a22 * matB[3];
			return dest;
		};

		/**
		 * Rotates a 2x2-matrix by an angle
		 *
		 * @param {Float32Array} mat The 2x2-matrix to rotate
		 * @param {Number} angle The angle in radians
		 * @param {Float32Array} [dest] Optional 2x2-matrix receiving the result. If omitted mat will be used.
		 *
		 * @returns {Float32Array} dest if specified, mat otherwise
		 */
		mat2.rotate = function (mat, angle, dest) {
			if (!dest) {
				dest = mat;
			}
			var a11 = mat[0],
				a12 = mat[1],
				a21 = mat[2],
				a22 = mat[3],
				s = Math.sin(angle),
				c = Math.cos(angle);
			dest[0] = a11 * c + a12 * s;
			dest[1] = a11 * -s + a12 * c;
			dest[2] = a21 * c + a22 * s;
			dest[3] = a21 * -s + a22 * c;
			return dest;
		};

		/**
		 * Multiplies the 2d-vector by the given 2x2-matrix
		 *
		 * @param {Float32Array} matrix the 2x2-matrix to multiply against
		 * @param {Float32Array} vec the 2d-vector to multiply
		 * @param {Float32Array} [dest] an optional receiving 2d-vector. If not given, vec is used.
		 *
		 * @returns {Float32Array} The 2d-vector multiplication result
		 **/
		mat2.multiplyVec2 = function (matrix, vec, dest) {
			if (!dest) dest = vec;
			var x = vec[0], y = vec[1];
			dest[0] = x * matrix[0] + y * matrix[1];
			dest[1] = x * matrix[2] + y * matrix[3];
			return dest;
		};

		/**
		 * Scales the 2x2-matrix by the dimensions in the given 2d-vector
		 *
		 * @param {Float32Array} matrix the 2x2 matrix to scale
		 * @param {Float32Array} vec the 2d-vector containing the dimensions to scale by
		 * @param {Float32Array} [dest] an optional receiving 2x2-matrix. If not given, matrix is used.
		 *
		 * @returns {Float32Array} dest if specified, matrix otherwise
		 **/
		mat2.scale = function (matrix, vec, dest) {
			if (!dest) {
				dest = matrix;
			}
			var a11 = matrix[0],
				a12 = matrix[1],
				a21 = matrix[2],
				a22 = matrix[3],
				b11 = vec[0],
				b22 = vec[1];
			dest[0] = a11 * b11;
			dest[1] = a12 * b22;
			dest[2] = a21 * b11;
			dest[3] = a22 * b22;
			return dest;
		};

		/**
		 * Returns a string representation of a 2x2-matrix
		 *
		 * @param {Float32Array} mat 2x2-matrix to represent as a string
		 *
		 * @returns {String} String representation of 2x2-matrix
		 */
		mat2.str = function (mat) {
			return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] + ']';
		};


		return mat2;

	});
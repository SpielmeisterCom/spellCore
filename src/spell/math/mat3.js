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
 * **This class implements high performance 3x3 Matrix math.**
 *
 * Example usage:
 *
 *
 *     var matA = mat3.{@link #createFrom}(1, 2, 3, 4, 5, 6, 7, 8, 9);
 *     //=> matA is now a Float32Array with [1,2,3,4,5,6,7,8,9]
 *
 *     var matB = mat3.{@link #create}([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
 *     //=> matB is now a Float32Array with [10,11,12,13,14,15,16,17,18,19], The original array has been converted to a Float32Array.
 *
 *     var matC = mat3.{@link #create}();
 *     //=> matC is now [0,0,0,0,0,0,0,0,0]
 *
 *     // Multiply matA with matB and write the result to matC
 *     mat3.{@link #multiply}(matA, matB, matC);
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
 * @class spell.math.mat3
 * @singleton
 * @requires Math
 * @requires spell.shared.util.platform.Types
 */
define(
	"spell/math/mat3",
	[
		"spell/shared/util/platform/Types",
		"spell/math/vec2"
	],
	function(
		Types,
	    vec2
	) {

		"use strict";
		var createFloatArray = Types.createFloatArray;

		// Tweak to your liking
		var FLOAT_EPSILON = 0.000001;

		var mat3 = {};

		/**
		 * Creates a new instance of a mat3 using the default array type
		 * Any javascript array-like object containing at least 9 numeric elements can serve as a mat3
		 *
		 * @param {Float32Array} [mat] 3x3-matrix containing values to initialize with
		 *
		 * @returns {Float32Array} New 3x3-matrix
		 */
		mat3.create = function (mat) {
			var dest = createFloatArray(9);

			if (mat) {
				dest[0] = mat[0];
				dest[1] = mat[1];
				dest[2] = mat[2];
				dest[3] = mat[3];
				dest[4] = mat[4];
				dest[5] = mat[5];
				dest[6] = mat[6];
				dest[7] = mat[7];
				dest[8] = mat[8];
			} else {
				dest[0] = dest[1] =
					dest[2] = dest[3] =
						dest[4] = dest[5] =
							dest[6] = dest[7] =
								dest[8] = 0;
			}

			return dest;
		};

		/**
		 * Creates a new instance of a mat3, initializing it with the given arguments
		 *
		 * @param {number} m00
		 * @param {number} m01
		 * @param {number} m02
		 * @param {number} m10
		 * @param {number} m11
		 * @param {number} m12
		 * @param {number} m20
		 * @param {number} m21
		 * @param {number} m22

		 * @returns {Float32Array} New 3x3-matrix
		 */
		mat3.createFrom = function (m00, m01, m02, m10, m11, m12, m20, m21, m22) {
			var dest = createFloatArray(9);

			dest[0] = m00;
			dest[1] = m01;
			dest[2] = m02;
			dest[3] = m10;
			dest[4] = m11;
			dest[5] = m12;
			dest[6] = m20;
			dest[7] = m21;
			dest[8] = m22;

			return dest;
		};

		/**
		 * Calculates the determinant of a mat3
		 *
		 * @param {Float32Array} mat 3x3-matrix to calculate determinant of
		 *
		 * @returns {Number} determinant of mat
		 */
		mat3.determinant = function (mat) {
			var a00 = mat[0], a01 = mat[1], a02 = mat[2],
				a10 = mat[3], a11 = mat[4], a12 = mat[5],
				a20 = mat[6], a21 = mat[7], a22 = mat[8];

			return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
		};

		/**
		 * Calculates the inverse matrix of a mat3
		 *
		 * @param {Float32Array} mat 3x3-matrix to calculate inverse of
		 * @param {Float32Array} [dest] 3x3-matrix receiving inverse matrix. If not specified result is written to mat
		 *
		 * @returns {Float32Array} dest is specified, mat otherwise, null if matrix cannot be inverted
		 */
		mat3.inverse = function (mat, dest) {
			var a00 = mat[0], a01 = mat[1], a02 = mat[2],
				a10 = mat[3], a11 = mat[4], a12 = mat[5],
				a20 = mat[6], a21 = mat[7], a22 = mat[8],

				b01 = a22 * a11 - a12 * a21,
				b11 = -a22 * a10 + a12 * a20,
				b21 = a21 * a10 - a11 * a20,

				d = a00 * b01 + a01 * b11 + a02 * b21,
				id;

			if (!d) {
				return null;
			}
			id = 1 / d;

			if (!dest) {
				dest = mat3.create();
			}

			dest[0] = b01 * id;
			dest[1] = (-a22 * a01 + a02 * a21) * id;
			dest[2] = (a12 * a01 - a02 * a11) * id;
			dest[3] = b11 * id;
			dest[4] = (a22 * a00 - a02 * a20) * id;
			dest[5] = (-a12 * a00 + a02 * a10) * id;
			dest[6] = b21 * id;
			dest[7] = (-a21 * a00 + a01 * a20) * id;
			dest[8] = (a11 * a00 - a01 * a10) * id;
			return dest;
		};

		/**
		 * Performs a matrix multiplication
		 *
		 * @param {Float32Array} mat 3x3-matrix First operand
		 * @param {Float32Array} mat2 3x3-matrix Second operand
		 * @param {Float32Array} [dest] 3x3-matrix receiving operation result. If not specified result is written to mat
		 *
		 * @returns {Float32Array} dest if specified, mat otherwise
		 */
		mat3.multiply = function (mat, mat2, dest) {
			if (!dest) {
				dest = mat;
			}


			// Cache the matrix values (makes for huge speed increases!)
			var a00 = mat[0], a01 = mat[1], a02 = mat[2],
				a10 = mat[3], a11 = mat[4], a12 = mat[5],
				a20 = mat[6], a21 = mat[7], a22 = mat[8],

				b00 = mat2[0], b01 = mat2[1], b02 = mat2[2],
				b10 = mat2[3], b11 = mat2[4], b12 = mat2[5],
				b20 = mat2[6], b21 = mat2[7], b22 = mat2[8];

			dest[0] = b00 * a00 + b01 * a10 + b02 * a20;
			dest[1] = b00 * a01 + b01 * a11 + b02 * a21;
			dest[2] = b00 * a02 + b01 * a12 + b02 * a22;

			dest[3] = b10 * a00 + b11 * a10 + b12 * a20;
			dest[4] = b10 * a01 + b11 * a11 + b12 * a21;
			dest[5] = b10 * a02 + b11 * a12 + b12 * a22;

			dest[6] = b20 * a00 + b21 * a10 + b22 * a20;
			dest[7] = b20 * a01 + b21 * a11 + b22 * a21;
			dest[8] = b20 * a02 + b21 * a12 + b22 * a22;

			return dest;
		};

		/**
		 * Transforms the given 2d-vector according to the given 3x3-matrix.
		 *
		 * @param {Float32Array} matrix 3x3-matrix to multiply against
		 * @param {Float32Array} vec the 2d-vector to multiply
		 * @param {Float32Array} [dest] an optional receiving 2d-vector. If not given, vec is used.
		 *
		 * @returns {Float32Array} The 2d-vector multiplication result
		 **/
		mat3.multiplyVec2 = function (matrix, vec, dest) {
			if (!dest) dest = vec;
			var x = vec[0], y = vec[1];
			dest[0] = x * matrix[0] + y * matrix[3] + matrix[6];
			dest[1] = x * matrix[1] + y * matrix[4] + matrix[7];
			return dest;
		};

		/**
		 * Transforms the 3d-vector according to the given 3x3-matrix
		 *
		 * @param {Float32Array} matrix 3x3-matrix to multiply against
		 * @param {Float32Array} vec the 3d-vector to multiply
		 * @param {Float32Array} [dest] an optional receiving 3d-vector. If not given, vec is used.
		 *
		 * @returns {Float32Array} The 3d-vector multiplication result
		 **/
		mat3.multiplyVec3 = function (matrix, vec, dest) {
			if (!dest) dest = vec;
			var x = vec[0], y = vec[1], z = vec[2];
			dest[0] = x * matrix[0] + y * matrix[3] + z * matrix[6];
			dest[1] = x * matrix[1] + y * matrix[4] + z * matrix[7];
			dest[2] = x * matrix[2] + y * matrix[5] + z * matrix[8];

			return dest;
		};

		/**
		 * Copies the values of one 3x3-matrix to another
		 *
		 * @param {Float32Array} mat 3x3-matrix containing values to copy
		 * @param {Float32Array} dest 3x3-matrix receiving copied values
		 *
		 * @returns {Float32Array} dest 3x3-matrix
		 */
		mat3.set = function (mat, dest) {
			dest[0] = mat[0];
			dest[1] = mat[1];
			dest[2] = mat[2];
			dest[3] = mat[3];
			dest[4] = mat[4];
			dest[5] = mat[5];
			dest[6] = mat[6];
			dest[7] = mat[7];
			dest[8] = mat[8];
			return dest;
		};

		/**
		 * Sets the diagonal values of the matrix from the given values
		 *
		 * @param {Float32Array} mat The 3x3-matrix to receive the values
		 * @param {number} a00 The value for (0, 0)
		 * @param {number} a11 The value for (1, 1)
		 * @param {number} a22 The value for (2, 2)
		 * @return {Float32Array} return mat with new diagonal values set
		 */
		mat3.setDiagonalValues = function(mat, a00, a11, a22) {
			mat[0] = a00;
			mat[4] = a11;
			mat[8] = a22;
			return mat;
		};

		/**
		 * Sets the diagonal values of the matrix from the given 2d-vector
		 * @param {Float32Array} mat The 3x3-matrix to receive the values
		 * @param {Float32Array} vec a 3d-vector containing the values
		 * @return {Float32Array}
		 */
		mat3.setDiagonalVec3 = function(mat, vec) {
			mat[0] = vec[0];
			mat[4] = vec[1];
			mat[8] = vec[2];
			return mat;
		};


		/**
		 * Compares two matrices for equality within a certain margin of error
		 *
		 * @param {Float32Array} a First 3x3-matrix
		 * @param {Float32Array} b Second 3x3-matrix
		 *
		 * @returns {Boolean} True if a is equivalent to b
		 */
		mat3.equal = function (a, b) {
			return a === b || (
				Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
					Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
					Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
					Math.abs(a[3] - b[3]) < FLOAT_EPSILON &&
					Math.abs(a[4] - b[4]) < FLOAT_EPSILON &&
					Math.abs(a[5] - b[5]) < FLOAT_EPSILON &&
					Math.abs(a[6] - b[6]) < FLOAT_EPSILON &&
					Math.abs(a[7] - b[7]) < FLOAT_EPSILON &&
					Math.abs(a[8] - b[8]) < FLOAT_EPSILON
				);
		};

		/**
		 * Sets a 3x3-matrix to an identity matrix
		 *
		 * @param {Float32Array} dest 3x3-matrix to set
		 *
		 * @returns {Float32Array} dest if specified, otherwise a new 3x3-matrix
		 */
		mat3.identity = function (dest) {
			if (!dest) {
				dest = mat3.create();
			}
			dest[0] = 1;
			dest[1] = 0;
			dest[2] = 0;
			dest[3] = 0;
			dest[4] = 1;
			dest[5] = 0;
			dest[6] = 0;
			dest[7] = 0;
			dest[8] = 1;
			return dest;
		};

		/**
		 * Transposes a 3x3-matrix (flips the values over the diagonal)
		 *
		 * Params:
		 * @param {Float32Array} mat 3x3-matrix to transpose
		 * @param {Float32Array} [dest] 3x3-matrix receiving transposed values. If not specified result is written to mat
		 *
		 * @returns {Float32Array} dest is specified, mat otherwise
		 */
		mat3.transpose = function (mat, dest) {
			// If we are transposing ourselves we can skip a few steps but have to cache some values
			if (!dest || mat === dest) {
				var a01 = mat[1], a02 = mat[2],
					a12 = mat[5];

				mat[1] = mat[3];
				mat[2] = mat[6];
				mat[3] = a01;
				mat[5] = mat[7];
				mat[6] = a02;
				mat[7] = a12;
				return mat;
			}

			dest[0] = mat[0];
			dest[1] = mat[3];
			dest[2] = mat[6];
			dest[3] = mat[1];
			dest[4] = mat[4];
			dest[5] = mat[7];
			dest[6] = mat[2];
			dest[7] = mat[5];
			dest[8] = mat[8];
			return dest;
		};

		/**
		 * Copies the elements of a 3x3-matrix into the upper 3x3 elements of a 4x4-matrix
		 *
		 * @param {Float32Array} mat 3x3-matrix containing values to copy
		 * @param {Float32Array} [dest] 4x4-matrix receiving copied values
		 *
		 * @returns {Float32Array} dest if specified, a new 4x4-matrix otherwise
		 */
		mat3.toMat4 = function (mat, dest) {
			if (!dest) {
				dest = Types.createFloatArray( 16 );
			}

			dest[15] = 1;
			dest[14] = 0;
			dest[13] = 0;
			dest[12] = 0;

			dest[11] = 0;
			dest[10] = mat[8];
			dest[9] = mat[7];
			dest[8] = mat[6];

			dest[7] = 0;
			dest[6] = mat[5];
			dest[5] = mat[4];
			dest[4] = mat[3];

			dest[3] = 0;
			dest[2] = mat[2];
			dest[1] = mat[1];
			dest[0] = mat[0];

			return dest;
		};

		/**
		 * Returns a string representation of a 3x3-matrix
		 * @param {Float32Array} mat 3x3-matrix to represent as a string
		 *
		 * @returns {string} String representation of mat
		 */
		mat3.str = function (mat) {
			return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] +
				', ' + mat[3] + ', ' + mat[4] + ', ' + mat[5] +
				', ' + mat[6] + ', ' + mat[7] + ', ' + mat[8] + ']';
		};

		/**
		 * Creates a 3x3 scale matrix with x, y, and z scale factors.
		 * @param {number} x The scale along the x axis
		 * @param {number} y The scale along the y axis
		 * @param {number} z The scale along the z axis
		 * @param {Float32Array} [dest] optional 3x3-matrix receiving operation result, if not specified a new mat3 will be created
		 * @return {Float32Array} A 3x3-matrix
		 */
		mat3.createScaleMatrix = function(x, y, z, dest) {

			if (dest === undefined) {
				dest = mat3.create()
			}

			mat3.setDiagonalValues(dest, x, y, z)

			return dest
		}


		/**
		 * Scales a 3x3-matrix by the given 3d-vector
		 *
		 * @param {Float32Array} mat 3x3-matrix to scale
		 * @param {Float32Array} vec 2d-vector specifying the scale for each axis
		 * @param {Float32Array} [dest] 3x3-matrix receiving operation result. If not specified result is written to mat
		 *
		 * @returns {Float32Array} dest if specified, mat otherwise
		 */
		mat3.scale = function (mat, vec, dest) {
			var x = vec[0], y = vec[1];

			if (!dest || mat === dest) {
				mat[0] *= x;
				mat[1] *= x;
				mat[2] *= x;
				mat[3] *= y;
				mat[4] *= y;
				mat[5] *= y;
				return mat;
			}

			dest[0] = mat[0] * x;
			dest[1] = mat[1] * x;
			dest[2] = mat[2] * x;
			dest[3] = mat[3] * y;
			dest[4] = mat[4] * y;
			dest[5] = mat[5] * y;
			dest[6] = mat[6];
			dest[7] = mat[7];
			dest[8] = mat[8];
			return dest;
		};

		/**
		 * Creates a new rotation matrix with the given rotation angle
		 *
		 * @param {number} angle The rotation angle in radians.
		 * @param {Float32Array} [dest] optional 3x3-matrix receiving operation result, if not specified a new mat3 will be created
		 * @returns {Float32Array} New 3x3-matrix
		 */
		mat3.createRotateMatrix = function(angle, dest) {
			var sine   = Math.sin(angle),
				cosine  = Math.cos(angle);

			if ( dest === undefined ) {
				dest = mat3.create();
			}

			dest[0] = cosine
			dest[1] = sine
			dest[2] = 0
			dest[3] = -sine
			dest[4] = cosine
			dest[5] = 0
			dest[6] = 0
			dest[7] = 0
			dest[8] = 1


			return dest
		}

		/**
		 * Creates a new Translation Matrix ith x and y
		 * translation values.
		 * @param {number} x The translation along the x axis
		 * @param {number} y The translation along the y axis
		 * @param {Float32Array} [dest] optional 3x3-matrix receiving operation result, if not specified a new mat3 will be created
		 */
		mat3.createTranslateMatrix = function(x, y, dest) {

			if (dest === undefined) {
				dest = mat3.create()
			}

			dest[0] = 1
			dest[1] = 0
			dest[2] = 0

			dest[3] = 0
			dest[4] = 1
			dest[5] = 0

			dest[6] = x
			dest[7] = y
			dest[8] = 1

			return dest
		}


		/**
		 * Translates a matrix by the given vector
		 *
		 * @param {Float32Array} mat 3x3-matrix to translate
		 * @param {Float32Array} vec 2d-vector specifying the translation
		 * @param {Float32Array} [dest] 3x3-matrix receiving operation result. If not specified result is written to mat
		 *
		 * @returns {Float32Array} dest if specified, mat otherwise
		 */
		mat3.translate = function (mat, vec, dest) {
			var x = vec[0], y = vec[1],
				a00 = mat[0], a01 = mat[1], a02 = mat[2],
				a10 = mat[3], a11 = mat[4], a12 = mat[5],
				a20 = mat[6], a21 = mat[7], a22 = mat[8]

			if( dest === undefined ) {
				dest = mat
			}

			dest[0] = a00;
			dest[1] = a01;
			dest[2] = a02;

			dest[3] = a10;
			dest[4] = a11;
			dest[5] = a12;

			dest[6] = x * a00 + y * a10 + a20;
			dest[7] = x * a01 + y * a11 + a21;
			dest[8] = x * a02 + y * a12 + a22;

			return dest;
		};

		/**
		 * Generates a orthogonal projection matrix with the given bounds
		 *
		 * @param {Number} left Left bound of the frustum
		 * @param {Number} right Right bound of the frustum
		 * @param {Number} bottom Bottom bound of the frustum
		 * @param {Number} top Top bound of the frustum
		 * @param {Float32Array} [dest] 3x3 frustum matrix will be written into
		 *
		 * @returns {Float32Array} dest if specified, a new 3x3-matrix otherwise
		 */
		mat3.ortho = function (left, right, bottom, top, dest) {
			if (!dest) {
				dest = mat3.create();
			}
			var rl = (right - left),
				tb = (top - bottom);
			dest[0] = 2 / rl;
			dest[1] = 0;
			dest[2] = 0;
			dest[3] = 0;
			dest[4] = 2 / tb;
			dest[5] = 0;
			dest[6] = -(left + right) / rl;
			dest[7] = -(top + bottom) / tb;
			dest[8] = 1;
			return dest;
		};

		/**
		 * Rotate the given matrix by angle
		 * @param mat
		 * @param angle
		 * @param dest
		 * @return {*}
		 */
		mat3.rotate = function(mat, angle, dest) {
			if (!dest) {
				dest = mat
			}

			var m00 = mat[0], m10 = mat[1], m20 = mat[2],
				m01 = mat[3], m11 = mat[4], m21 = mat[5],
				sine   = Math.sin(angle),
				cosine  = Math.cos(angle);

			dest[0] = m00 * cosine + m01 * sine;
			dest[1] = m10 * cosine + m11 * sine;
			dest[2] = m20 * cosine + m21 * sine;
			dest[3] = m00 * -sine + m01 * cosine;
			dest[4] = m10 * -sine + m11 * cosine;
			dest[5] = m20 * -sine + m21 * cosine;
			dest[6] = mat[6]
			dest[7] = mat[7]
			dest[8] = mat[8]

			return dest;
		}

		/**
		 * Applies a skew transformation to the matrix.
		 */
		mat3.skew = function(mat, skew, dest) {
			if (!dest) {
				dest = mat
			}

			var m00 = mat[0], m10 = mat[1], m20 = mat[2],
				m01 = mat[3], m11 = mat[4], m21 = mat[5],
				sineX      = Math.sin( skew[0] ),
				cosineX    = Math.cos( skew[0] ),
				sineY      = Math.sin( skew[1] ),
				cosineY    = Math.cos( skew[1] )

			dest[0] *= cosineY
			dest[1] *= sineY

			dest[3] *= -1 * sineX;
			dest[4] *= cosineX;


/*
			dest[0] = m00 * cosineY + m01 * sineY;
			dest[1] = m10 * cosineY + m11 * sineY;
			dest[2] = m20 * cosineY + m21 * sineY;
			dest[3] = m00 * -sineX + m01 * cosineX;
			dest[4] = m10 * -sineX + m11 * cosineX;
			dest[5] = m20 * -sineX + m21 * cosineX;
			dest[6] = mat[6]
			dest[7] = mat[7]
			dest[8] = 1;
*/
			return dest;
		}


		/**
		 * Decomposes a Scale * Rotate * Translate Matrix into it's components
		 * @param {Float32Array} 3x3-matrix
		 * @param {Float32Array} [dest] 2d-Vector if specified, the result will be written in dest. Otherwise a new 2d-Vector will be created and returned
		 * @return {Float32Array} 2d-Vector with the result
		 */
		mat3.decompose = function( mat, scale, skew, translation ) {

			var tmp = mat3.create(mat)

			var a00    = mat[ 0 ],
				a01    = mat[ 1 ],
				a10    = mat[ 3 ],
				a11    = mat[ 4 ],
				a = mat[0],
				b = mat[1],

				c = mat[3],
				d = mat[4],
				rotation = 0


			if( scale === undefined ) {
				scale = vec2.create()
			}

			if ( translation === undefined ) {
				translation = vec2.create()
			}

			if ( skew === undefined ) {
				skew = vec2.create()
			}

			//scale[0] = Math.sqrt( (a * a) + (b * b) )
			//scale[1] = Math.sqrt( (c * c) + (d * d) )

			scale[1] = Math.sqrt( (a01 * a01) + (a11 * a11) )
			scale[0] = Math.sqrt( (a00 * a00) + (a10 * a10) )


			tmp[0] /= scale[0]
			tmp[1] /= scale[0]
			tmp[2] /= scale[0]

			tmp[3] /= scale[1]
			tmp[4] /= scale[1]
			tmp[5] /= scale[1]

			skew[0] = Math.atan2(-c, d)
			skew[1] = Math.atan2(b, a)

			mat3.inverse( tmp, tmp )
			mat3.multiplyVec2( tmp, [0, 0], translation )

			//translation[0]  = mat[6]
			//translation[1]  = mat[7]
		}

		return mat3;
	}
)

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
 * **This class implements high performance quaternion math.**
 *
 * Please note: This object does not hold the quaternion components itself, it defines helper functions which manipulate
 * highly optimized data structures. This is done for performance reasons. **You need to allocate new quaternions
 * with the {@link #create} or {@link #createFrom} function. Don't try to allocate new quaternions yourself, always use
 * these function to do so.**
 *
 *
 * *This class is derived from [glMatrix](https://github.com/toji/gl-matrix) 1.3.7 originally written by Brandon Jones
 * and Colin MacKenzie IV. The original BSD licence is included in the source file of this class.*
 *
 * @class spell.math.quat4
 * @singleton
 * @requires Math
 * @requires spell.shared.util.platform.Types
 * @requires spell.math.mat3
 * @requires spell.math.mat4
 * @requires spell.math.util
 */
define(
	"spell/math/quat4",
	[
		"spell/shared/util/platform/Types",
		"spell/math/mat3",
		"spell/math/mat4",
		"spell/math/util"
	],
	function(Types, mat3, mat4, mathUtil) {

		"use strict";
		var createFloatArray = Types.createFloatArray;


		// Tweak to your liking
		var FLOAT_EPSILON = 0.000001;

		var quat4 = {};

		/**
		 * Creates a new instance of a quat4 using the default array type
		 * Any javascript array containing at least 4 numeric elements can serve as a quat4
		 *
		 * @param {Float32Array} [quat] Quaternion containing values to initialize with
		 *
		 * @returns {Float32Array} New quaternion
		 */
		quat4.create = function (quat) {
			var dest = createFloatArray(4);

			if (quat) {
				dest[0] = quat[0];
				dest[1] = quat[1];
				dest[2] = quat[2];
				dest[3] = quat[3];
			} else {
				dest[0] = dest[1] = dest[2] = dest[3] = 0;
			}

			return dest;
		};

		/**
		 * Creates a new instance of a quaternion, initializing it with the given arguments
		 *
		 * @param {Number} x X value
		 * @param {Number} y Y value
		 * @param {Number} z Z value
		 * @param {Number} w W value

		 * @returns {Float32Array} New quaternion
		 */
		quat4.createFrom = function (x, y, z, w) {
			var dest = createFloatArray(4);

			dest[0] = x;
			dest[1] = y;
			dest[2] = z;
			dest[3] = w;

			return dest;
		};

		/**
		 * Copies the values of one quaternion to another
		 *
		 * @param {Float32Array} quat quaternion containing values to copy
		 * @param {Float32Array} dest quaternion receiving copied values
		 *
		 * @returns {Float32Array} dest
		 */
		quat4.set = function (quat, dest) {
			dest[0] = quat[0];
			dest[1] = quat[1];
			dest[2] = quat[2];
			dest[3] = quat[3];

			return dest;
		};

		/**
		 * Compares two quaternions for equality within a certain margin of error
		 *
		 * @param {Float32Array} a First quaternion
		 * @param {Float32Array} b Second quaternion
		 *
		 * @returns {Boolean} True if a is equivalent to b
		 */
		quat4.equal = function (a, b) {
			return a === b || (
				Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
					Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
					Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
					Math.abs(a[3] - b[3]) < FLOAT_EPSILON
				);
		};

		/**
		 * Creates a new identity quaternion
		 *
		 * @param {Float32Array} [dest] quaternion receiving copied values
		 *
		 * @returns {Float32Array} dest is specified, new quaternion otherwise
		 */
		quat4.identity = function (dest) {
			if (!dest) {
				dest = quat4.create();
			}
			dest[0] = 0;
			dest[1] = 0;
			dest[2] = 0;
			dest[3] = 1;
			return dest;
		};

		var identityQuat4 = quat4.identity();

		/**
		 * Calculates the W component of a quaternion from the X, Y, and Z components.
		 * Assumes that quaternion is 1 unit in length.
		 * Any existing W component will be ignored.
		 *
		 * @param {Float32Array} quat quaternion to calculate W component of
		 * @param {Float32Array} [dest] quaternion receiving calculated values. If not specified result is written to quat
		 *
		 * @returns {Float32Array} dest if specified, quat otherwise
		 */
		quat4.calculateW = function (quat, dest) {
			var x = quat[0], y = quat[1], z = quat[2];

			if (!dest || quat === dest) {
				quat[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
				return quat;
			}
			dest[0] = x;
			dest[1] = y;
			dest[2] = z;
			dest[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
			return dest;
		};

		/**
		 * Calculates the dot product of two quaternions
		 *
		 * @param {Float32Array} quat First operand quaternion
		 * @param {Float32Array} quat2 Second operand quaternion
		 *
		 * @return {Number} Dot product of quat and quat2
		 */
		quat4.dot = function (quat, quat2) {
			return quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3];
		};

		/**
		 * Calculates the inverse of a quaternion
		 *
		 * @param {Float32Array} quat quaternion to calculate inverse of
		 * @param {Float32Array} [dest] quaternion receiving inverse values. If not specified result is written to quat
		 *
		 * @returns {Float32Array} dest if specified, quat otherwise
		 */
		quat4.inverse = function (quat, dest) {
			var q0 = quat[0], q1 = quat[1], q2 = quat[2], q3 = quat[3],
				dot = q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3,
				invDot = dot ? 1.0 / dot : 0;

			// TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

			if (!dest || quat === dest) {
				quat[0] *= -invDot;
				quat[1] *= -invDot;
				quat[2] *= -invDot;
				quat[3] *= invDot;
				return quat;
			}
			dest[0] = -quat[0] * invDot;
			dest[1] = -quat[1] * invDot;
			dest[2] = -quat[2] * invDot;
			dest[3] = quat[3] * invDot;
			return dest;
		};


		/**
		 * Calculates the conjugate of a quaternion
		 * If the quaternion is normalized, this function is faster than quat4.inverse and produces the same result.
		 *
		 * @param {Float32Array} quat quaternion to calculate conjugate of
		 * @param {Float32Array} [dest] quaternion receiving conjugate values. If not specified result is written to quat
		 *
		 * @returns {Float32Array} dest if specified, quat otherwise
		 */
		quat4.conjugate = function (quat, dest) {
			if (!dest || quat === dest) {
				quat[0] *= -1;
				quat[1] *= -1;
				quat[2] *= -1;
				return quat;
			}
			dest[0] = -quat[0];
			dest[1] = -quat[1];
			dest[2] = -quat[2];
			dest[3] = quat[3];
			return dest;
		};

		/**
		 * Calculates the length of a quaternion
		 *
		 * Params:
		 * @param {Float32Array} quat Quaternion to calculate length of
		 *
		 * @returns {Number} Length of quat
		 */
		quat4.length = function (quat) {
			var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
			return Math.sqrt(x * x + y * y + z * z + w * w);
		};

		/**
		 * Generates a unit quaternion of the same direction as the provided quat4
		 * If quaternion length is 0, returns [0, 0, 0, 0]
		 *
		 * @param {Float32Array} quat Quaternion to normalize
		 * @param {Float32Array} [dest] Quaternion receiving operation result. If not specified result is written to quat
		 *
		 * @returns {Float32Array} dest if specified, quat otherwise
		 */
		quat4.normalize = function (quat, dest) {
			if (!dest) {
				dest = quat;
			}

			var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
				len = Math.sqrt(x * x + y * y + z * z + w * w);
			if (len === 0) {
				dest[0] = 0;
				dest[1] = 0;
				dest[2] = 0;
				dest[3] = 0;
				return dest;
			}
			len = 1 / len;
			dest[0] = x * len;
			dest[1] = y * len;
			dest[2] = z * len;
			dest[3] = w * len;

			return dest;
		};

		/**
		 * Performs quaternion addition
		 *
		 * @param {Float32Array} quat First operand quaternion
		 * @param {Float32Array} quat2 Second operand quaternion
		 * @param {Float32Array} [dest] Quaternion receiving operation result. If not specified result is written to quat
		 *
		 * @returns {Float32Array} dest if specified, quat otherwise
		 */
		quat4.add = function (quat, quat2, dest) {
			if (!dest || quat === dest) {
				quat[0] += quat2[0];
				quat[1] += quat2[1];
				quat[2] += quat2[2];
				quat[3] += quat2[3];
				return quat;
			}
			dest[0] = quat[0] + quat2[0];
			dest[1] = quat[1] + quat2[1];
			dest[2] = quat[2] + quat2[2];
			dest[3] = quat[3] + quat2[3];
			return dest;
		};

		/**
		 * Performs a quaternion multiplication
		 *
		 * @param {Float32Array} quat First operand quaternion
		 * @param {Float32Array} quat2 Second operand quaternion
		 * @param {Float32Array} [dest] Quaternion receiving operation result. If not specified result is written to quat
		 *
		 * @returns {Float32Array} dest if specified, quat otherwise
		 */
		quat4.multiply = function (quat, quat2, dest) {
			if (!dest) {
				dest = quat;
			}

			var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3],
				qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];

			dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
			dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
			dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
			dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

			return dest;
		};

		/**
		 * Transforms a 3d-vector with the given quaternion
		 *
		 * @param {Float32Array} quat quaternion to transform the vector with
		 * @param {Float32Array} vec 3d-vector to transform
		 * @param {Float32Array} [dest] 3d-vector receiving operation result. If not specified result is written to vec
		 *
		 * @returns dest if specified, vec otherwise
		 */
		quat4.multiplyVec3 = function (quat, vec, dest) {
			if (!dest) {
				dest = vec;
			}

			var x = vec[0], y = vec[1], z = vec[2],
				qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3],

			// calculate quat * vec
				ix = qw * x + qy * z - qz * y,
				iy = qw * y + qz * x - qx * z,
				iz = qw * z + qx * y - qy * x,
				iw = -qx * x - qy * y - qz * z;

			// calculate result * inverse quat
			dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
			dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
			dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

			return dest;
		};

		/**
		 * Multiplies the components of a quaternion by a scalar value
		 *
		 * @param {Float32Array} quat quaternion to scale
		 * @param {Number} val Value to scale by
		 * @param {Float32Array} [dest] quaternion receiving operation result. If not specified result is written to quat
		 *
		 * @returns {Float32Array} dest if specified, quat otherwise
		 */
		quat4.scale = function (quat, val, dest) {
			if (!dest || quat === dest) {
				quat[0] *= val;
				quat[1] *= val;
				quat[2] *= val;
				quat[3] *= val;
				return quat;
			}
			dest[0] = quat[0] * val;
			dest[1] = quat[1] * val;
			dest[2] = quat[2] * val;
			dest[3] = quat[3] * val;
			return dest;
		};

		/**
		 * Calculates a 3x3 matrix from the given quaternion
		 *
		 * @param {Float32Array} quat quaternion to create matrix from
		 * @param {Float32Array} [dest] 3x3-matrix receiving operation result
		 *
		 * @returns {Float32Array} dest if specified, a new 3x3-matrix otherwise
		 */
		quat4.toMat3 = function (quat, dest) {
			if (!dest) {
				dest = mat3.create();
			}

			var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
				x2 = x + x,
				y2 = y + y,
				z2 = z + z,

				xx = x * x2,
				xy = x * y2,
				xz = x * z2,
				yy = y * y2,
				yz = y * z2,
				zz = z * z2,
				wx = w * x2,
				wy = w * y2,
				wz = w * z2;

			dest[0] = 1 - (yy + zz);
			dest[1] = xy + wz;
			dest[2] = xz - wy;

			dest[3] = xy - wz;
			dest[4] = 1 - (xx + zz);
			dest[5] = yz + wx;

			dest[6] = xz + wy;
			dest[7] = yz - wx;
			dest[8] = 1 - (xx + yy);

			return dest;
		};

		/**
		 * Calculates a 4x4 matrix from the given quaternion
		 *
		 * @param {Float32Array} quat quaternion to create matrix from
		 * @param {Float32Array} [dest] 4x4-matrix receiving operation result
		 *
		 * @returns {Float32Array} dest if specified, a new 4x4-matrix otherwise
		 */
		quat4.toMat4 = function (quat, dest) {
			if (!dest) {
				dest = mat4.create();
			}

			var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
				x2 = x + x,
				y2 = y + y,
				z2 = z + z,

				xx = x * x2,
				xy = x * y2,
				xz = x * z2,
				yy = y * y2,
				yz = y * z2,
				zz = z * z2,
				wx = w * x2,
				wy = w * y2,
				wz = w * z2;

			dest[0] = 1 - (yy + zz);
			dest[1] = xy + wz;
			dest[2] = xz - wy;
			dest[3] = 0;

			dest[4] = xy - wz;
			dest[5] = 1 - (xx + zz);
			dest[6] = yz + wx;
			dest[7] = 0;

			dest[8] = xz + wy;
			dest[9] = yz - wx;
			dest[10] = 1 - (xx + yy);
			dest[11] = 0;

			dest[12] = 0;
			dest[13] = 0;
			dest[14] = 0;
			dest[15] = 1;

			return dest;
		};

		/**
		 * Performs a spherical linear interpolation between two quarternion
		 *
		 * @param {Float32Array} quat First quaternion
		 * @param {Float32Array} quat2 Second quaternion
		 * @param {number} slerp Interpolation amount between the two inputs
		 * @param {Float32Array} [dest] quaternion receiving operation result. If not specified result is written to quat
		 *
		 * @returns {Float32Array} dest if specified, quat otherwise
		 */
		quat4.slerp = function (quat, quat2, slerp, dest) {
			if (!dest) {
				dest = quat;
			}

			var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3],
				halfTheta,
				sinHalfTheta,
				ratioA,
				ratioB;

			if (Math.abs(cosHalfTheta) >= 1.0) {
				if (dest !== quat) {
					dest[0] = quat[0];
					dest[1] = quat[1];
					dest[2] = quat[2];
					dest[3] = quat[3];
				}
				return dest;
			}

			halfTheta = Math.acos(cosHalfTheta);
			sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

			if (Math.abs(sinHalfTheta) < 0.001) {
				dest[0] = (quat[0] * 0.5 + quat2[0] * 0.5);
				dest[1] = (quat[1] * 0.5 + quat2[1] * 0.5);
				dest[2] = (quat[2] * 0.5 + quat2[2] * 0.5);
				dest[3] = (quat[3] * 0.5 + quat2[3] * 0.5);
				return dest;
			}

			ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
			ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;

			dest[0] = (quat[0] * ratioA + quat2[0] * ratioB);
			dest[1] = (quat[1] * ratioA + quat2[1] * ratioB);
			dest[2] = (quat[2] * ratioA + quat2[2] * ratioB);
			dest[3] = (quat[3] * ratioA + quat2[3] * ratioB);

			return dest;
		};

		/**
		 * Creates a quaternion from the given 3x3 rotation matrix.
		 * If dest is omitted, a new quaternion will be created.
		 *
		 * @param {Float32Array} mat the 3x3 rotation matrix
		 * @param {Float32Array} [dest] an optional receiving quaternion
		 *
		 * @returns {Float32Array} the quaternion constructed from the rotation matrix
		 *
		 */
		quat4.fromRotationMatrix = function (mat, dest) {
			if (!dest) dest = quat4.create();

			// Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
			// article "Quaternion Calculus and Fast Animation".

			var fTrace = mat[0] + mat[4] + mat[8];
			var fRoot;

			if (fTrace > 0.0) {
				// |w| > 1/2, may as well choose w > 1/2
				fRoot = Math.sqrt(fTrace + 1.0); // 2w
				dest[3] = 0.5 * fRoot;
				fRoot = 0.5 / fRoot; // 1/(4w)
				dest[0] = (mat[7] - mat[5]) * fRoot;
				dest[1] = (mat[2] - mat[6]) * fRoot;
				dest[2] = (mat[3] - mat[1]) * fRoot;
			} else {
				// |w| <= 1/2
				var s_iNext = quat4.fromRotationMatrix.s_iNext = quat4.fromRotationMatrix.s_iNext || [1, 2, 0];
				var i = 0;
				if (mat[4] > mat[0])
					i = 1;
				if (mat[8] > mat[i * 3 + i])
					i = 2;
				var j = s_iNext[i];
				var k = s_iNext[j];

				fRoot = Math.sqrt(mat[i * 3 + i] - mat[j * 3 + j] - mat[k * 3 + k] + 1.0);
				dest[i] = 0.5 * fRoot;
				fRoot = 0.5 / fRoot;
				dest[3] = (mat[k * 3 + j] - mat[j * 3 + k]) * fRoot;
				dest[j] = (mat[j * 3 + i] + mat[i * 3 + j]) * fRoot;
				dest[k] = (mat[k * 3 + i] + mat[i * 3 + k]) * fRoot;
			}

			return dest;
		};


		(function () {
			var mat = mat3.create();

			/**
			 * Creates a quaternion from the 3 given vectors. They must be perpendicular
			 * to one another and represent the X, Y and Z axes.
			 *
			 * If dest is omitted, a new quat4 will be created.
			 *
			 * Example: The default OpenGL orientation has a view vector [0, 0, -1],
			 * right vector [1, 0, 0], and up vector [0, 1, 0]. A quaternion representing
			 * this orientation could be constructed with:
			 *
			 * quat = quat4.fromAxes([0, 0, -1], [1, 0, 0], [0, 1, 0], quat4.create());
			 *
			 * @param {Float32Array} view the view 3d-vector, or direction the object is pointing in
			 * @param {Float32Array} right the right 3d-vector, or direction to the "right" of the object
			 * @param {Float32Array} up the up 3d-vector, or direction towards the object's "up"
			 * @param {Float32Array} [dest] an optional receiving quaternion
			 *
			 * @returns {Float32Array} dest quaternion
			 **/
			quat4.fromAxes = function (view, right, up, dest) {
				mat[0] = right[0];
				mat[3] = right[1];
				mat[6] = right[2];

				mat[1] = up[0];
				mat[4] = up[1];
				mat[7] = up[2];

				mat[2] = view[0];
				mat[5] = view[1];
				mat[8] = view[2];

				return quat4.fromRotationMatrix(mat, dest);
			};
		})();

		/**
		 * Sets a quaternion from the given angle and rotation axis,
		 * then returns it. If dest is not given, a new quaternion is created.
		 *
		 * @param {Number} angle the angle in radians
		 * @param {Float32Array} axis 3d-vector describing the axis around which to rotate
		 * @param {Float32Array} [dest] the optional quaternion to store the result
		 *
		 * @returns {Float32Array} dest
		 **/
		quat4.fromAngleAxis = function (angle, axis, dest) {
			// The quaternion representing the rotation is
			// q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)
			if (!dest) dest = quat4.create();

			var half = angle * 0.5;
			var s = Math.sin(half);
			dest[3] = Math.cos(half);
			dest[0] = s * axis[0];
			dest[1] = s * axis[1];
			dest[2] = s * axis[2];

			return dest;
		};

		/**
		 * Stores the angle and axis in a 4d-vector, where the XYZ components represent
		 * the axis and the W (4th) component is the angle in radians.
		 *
		 * If dest is not given, src will be modified in place and returned, after
		 * which it should not be considered not a quaternion (just an axis and angle).
		 *
		 * @param {Float32Array} quat the quaternion whose angle and axis to store
		 * @param {Float32Array} [dest] the optional 4d-vector to receive the data
		 *
		 * @returns {Float32Array} dest 4d-vector containing the result
		 */
		quat4.toAngleAxis = function (src, dest) {
			if (!dest) dest = src;
			// The quaternion representing the rotation is
			// q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

			var sqrlen = src[0] * src[0] + src[1] * src[1] + src[2] * src[2];
			if (sqrlen > 0) {
				dest[3] = 2 * Math.acos(src[3]);
				var invlen = mathUtil.invsqrt(sqrlen);
				dest[0] = src[0] * invlen;
				dest[1] = src[1] * invlen;
				dest[2] = src[2] * invlen;
			} else {
				// angle is 0 (mod 2*pi), so any axis will do
				dest[3] = 0;
				dest[0] = 1;
				dest[1] = 0;
				dest[2] = 0;
			}

			return dest;
		};

		/**
		 * Returns a string representation of a quaternion
		 *
		 * @param {Float32Array} quat quaternion to represent as a string
		 *
		 * @returns {String} String representation of quaternion
		 */
		quat4.str = function (quat) {
			return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']';
		};

		return quat4;
	}
)

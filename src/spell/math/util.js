/**
 * Utility math functions.
 *
 * @singleton
 * @class spell.math.util
 */
define(
	'spell/math/util',
	[
		'spell/shared/util/platform/Types'
	],
	function(
		Types
	) {
		'use strict'


		var util = {}

		util.FLOAT_EPSILON = 0.000001

		util.random = Math.random

		if( Types.hasFloatArraySupport() ) {
			var y = Types.createFloatArray( 1 )
			var i = Types.Int32Array.create( y.buffer )

			/**
			 * Fast way to calculate the inverse square root. See http://jsperf.com/inverse-square-root/5.
			 * If typed arrays are not available, a slower implementation will be used.
			 *
			 * @private
			 */
			util.invsqrt = function( x ) {
				var x2 = x * 0.5
				y[ 0 ] = x
				var threehalfs = 1.5

				i[ 0 ] = 0x5f3759df - ( i[ 0 ] >> 1 )

				var x3 = y[ 0 ]

				return x3 * ( threehalfs - ( x2 * x3 * x3 ) )
			};

		} else {
			/**
			 * Returns the inverse square root of the value x.
			 *
			 * @param {Number} x
			 * @returns {Number}
			 */
			util.invsqrt = function( x ) {
				return 1.0 / Math.sqrt( x )
			};
		}

		/**
		 * Clamps the value into the range specified by lowerBound and upperBound.
		 *
		 * @param {Number} value
		 * @param {Number} lowerBound
		 * @param {Number} upperBound
		 * @return {Number}
		 */
		util.clamp = function( value, lowerBound, upperBound ) {
			if( value < lowerBound ) return lowerBound
			if( value > upperBound ) return upperBound

			return value
		};

		/**
		 * Returns true when the value lies within in the interval specified by lowerBound and upperBound.
		 *
		 * @param value
		 * @param lowerBound
		 * @param upperBound
		 * @return {Boolean}
		 */
		util.isInInterval = function( value, lowerBound, upperBound ) {
			return ( value >= lowerBound && value <= upperBound )
		};

		/**
		 * Returns the modulo of dividend and divisor. The result is always positive (i.e. a positive member of the quotient ring defined by dividend % divisor).
		 *
		 * @param {Number} dividend
		 * @param {Number} divisor
		 * @return {Number}
		 */
		util.modulo = function( dividend, divisor ) {
			var tmp = dividend % divisor

			return tmp < 0 ?
				( tmp + divisor ) % divisor :
				tmp
		};

		/**
		 * Returns the sign of the supplied value x.
		 *
		 * Example:
		 *
		 *     util.sign( 2 ) // -> 1
		 *     util.sign( -5 ) // -> -1
		 *
		 * @param {Number} x
		 * @return {Number}
		 */
		util.sign = function( x ) {
			return x >= 0 ? 1 : -1
		};

		/**
		 * Rounds the value to multiples of resolution.
		 *
		 * Example:
		 *
		 *     util.roundToResolution( 5, 0.6 ) // -> 4.8
		 *     util.roundToResolution( 1233, 10 ) // -> 1230
		 *
		 * @param {Number} value
		 * @param {Number} resolution
		 * @return {Number}
		 */
		util.roundToResolution = function( value, resolution ) {
			if( !resolution ) resolution = 0.5

			var rest = value % resolution

   			return value - rest + ( rest > ( resolution / 2 ) ? resolution : 0 )
		};

		/**
		 * Checks whether a point is contained in a (rotated) rectangle or not.
		 *
		 * @param {vec2} point point to check
		 * @param {vec2} rectOrigin point the original from the rectangle (in the middle)
		 * @param {Number} rectWidth width of the rectangle
		 * @param {Number} rectHeight height of the rectangle
		 * @param {Number} rectRotation rotation in radians
		 * @return {Boolean}
		 */
		util.isPointInRect = function( point, rectOrigin, rectWidth, rectHeight, rectRotation ) {
			var tmp     = rectRotation, // Math.PI / 180
				c       = Math.cos( tmp ),
				s       = Math.sin( tmp ),
				leftX   = rectOrigin[ 0 ] - rectWidth / 2,
				rightX  = rectOrigin[ 0 ] + rectWidth / 2,
				topY    = rectOrigin[ 1 ] - rectHeight / 2,
				bottomY = rectOrigin[ 1 ] + rectHeight / 2

			// unrotate the point depending on the rotation of the rectangle
			var rotatedX = rectOrigin[ 0 ] + c * ( point[ 0 ] - rectOrigin[ 0 ] ) - s * ( point[ 1 ] - rectOrigin[ 1 ] ),
				rotatedY = rectOrigin[ 1 ] + s * ( point[ 0 ] - rectOrigin[ 0 ] ) + c * ( point[ 1 ] - rectOrigin[ 1 ] )

			return leftX <= rotatedX && rotatedX <= rightX && topY <= rotatedY && rotatedY <= bottomY
		};

		/**
		 * Returns an orthographic projection matrix specified by the four clippings.
		 *
		 * @param {mat3} out the result mat3 matrix
		 * @param {Number} left the left clipping
		 * @param {Number} right the right clipping
		 * @param {Number} bottom the bottom clipping
		 * @param {Number} top the top clipping
		 * @return {mat3}
		 */
		util.mat3Ortho = function( out, left, right, bottom, top ) {
			var rl = ( right - left ),
				tb = ( top - bottom )

			out[ 0 ] = 2 / rl
			out[ 1 ] = 0
			out[ 2 ] = 0
			out[ 3 ] = 0
			out[ 4 ] = 2 / tb
			out[ 5 ] = 0
			out[ 6 ] = -( left + right ) / rl
			out[ 7 ] = -( top + bottom ) / tb
			out[ 8 ] = 1

			return out
		};

		return util
	}
)

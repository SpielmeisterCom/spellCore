/**
 * Utility class which implements (high speed) math functions
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
			var i = Types.createIntegerArray( y.buffer )

			/**
			 * Fast way to calculate the inverse square root,
			 * see [this page](http://jsperf.com/inverse-square-root/5)
			 *
			 * If typed arrays are not available, a slower
			 * implementation will be used.
			 *
			 * @param {Number} number the number
			 * @returns {Number} Inverse square root
			 */
			util.invsqrt = function( number ) {
				var x2 = number * 0.5
				y[ 0 ] = number
				var threehalfs = 1.5

				i[ 0 ] = 0x5f3759df - ( i[ 0 ] >> 1 )

				var number2 = y[ 0 ]

				return number2 * ( threehalfs - ( x2 * number2 * number2 ) )
			}

		} else {
			util.invsqrt = function( number ) {
				return 1.0 / Math.sqrt( number )
			}
		}

		util.clamp = function( value, lowerBound, upperBound ) {
			if ( value < lowerBound) return lowerBound
			if ( value > upperBound) return upperBound

			return value
		}

		util.isInInterval = function( value, lowerBound, upperBound ) {
			return ( value >= lowerBound && value <= upperBound )
		}

		/**
		 * This function returns a positive member of the quotient ring defined by dividend % divisor.
		 *
		 * @param dividend
		 * @param divisor
		 * @return {*}
		 */
		util.modulo = function( dividend, divisor ) {
			var tmp = dividend % divisor

			return tmp < 0 ?
				( tmp + divisor ) % divisor :
				tmp
		}

		util.sign = function( value ) {
			return value >= 0 ? 1 : -1
		}

		/**
		 * This function rounds to the specified resolution.
		 *
		 * @param value
		 * @param resolution
		 * @return {*}
		 */
		util.roundToResolution = function( value, resolution ) {
			if( !resolution ) resolution = 0.5

			var rest = value % resolution

   			return value - rest + ( rest > ( resolution / 2 ) ? resolution : 0 )
		}

		/**
		 * Checks whether a point is contained in a (rotated) rectangle or not
		 * @param point vec2 point to check
		 * @param rectOrigin vec2 point the original from the rectangle (in the middle)
		 * @param rectWidth Number Width of the rectangle
		 * @param rectHeight Number Height of the rectangle
		 * @param rectRotation Number Rotation in radians
		 * @return {Boolean}
		 */
		util.isPointInRect = function( point, rectOrigin, rectWidth, rectHeight, rectRotation ) {
			var tmp     = rectRotation, /** Math.PI / 180,*/
				c       = Math.cos( tmp ),
				s       = Math.sin( tmp ),
				leftX   = rectOrigin[ 0 ] - rectWidth / 2,
				rightX  = rectOrigin[ 0 ] + rectWidth / 2,
				topY    = rectOrigin[ 1 ] - rectHeight / 2,
				bottomY = rectOrigin[ 1 ] + rectHeight / 2

			// Unrotate the point depending on the rotation of the rectangle
			var rotatedX = rectOrigin[ 0 ] + c * ( point[ 0 ] - rectOrigin[ 0 ] ) - s * ( point[ 1 ] - rectOrigin[ 1 ] ),
				rotatedY = rectOrigin[ 1 ] + s * ( point[ 0 ] - rectOrigin[ 0 ] ) + c * ( point[ 1 ] - rectOrigin[ 1 ] )

			return leftX <= rotatedX && rotatedX <= rightX && topY <= rotatedY && rotatedY <= bottomY
		}

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
		}

		return util
	}
)

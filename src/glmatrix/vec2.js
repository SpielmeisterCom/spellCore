define(
	'glmatrix/vec2',
	[
		'spell/shared/util/platform/Types'
	],
	function(
		Types
	) {
		'use strict'


		var vec2 = {}

		/**
		 * Creates a new instance of a vec2 using the default array type
		 * Any javascript array-like objects containing at least 2 numeric elements can serve as a vec2
		 *
		 * @param {vec2} [vec] vec2 containing values to initialize with
		 *
		 * @returns {vec2} New vec2
		 */
		vec2.create = function( vec ) {
			var dest = Types.createNativeFloatArray( 2 )

			if( vec ) {
				dest[ 0 ] = vec[ 0 ]
				dest[ 1 ] = vec[ 1 ]

			} else {
				dest[ 0 ] = dest[ 1 ] = 0
			}

			return dest
		}

		/**
		 * Performs a vector multiplication
		 *
		 * @param {vec2} vec First operand
		 * @param {vec2} vec2 Second operand
		 * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec2} dest if specified, vec otherwise
		 */
		vec2.multiply = function( vec, vec2, dest ) {
			if( !dest || vec === dest ) {
				vec[ 0 ] *= vec2[ 0 ]
				vec[ 1 ] *= vec2[ 1 ]
				return vec
			}

			dest[ 0 ] = vec[ 0 ] * vec2[ 0 ]
			dest[ 1 ] = vec[ 1 ] * vec2[ 1 ]
			return dest
		}

		/**
		 * Performs a multiplication of a vector with a scalar
		 *
		 * @param {vec2} vec First operand
		 * @param {number} s Second operand
		 * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec2} dest if specified, vec otherwise
		 */
		vec2.multiplyScalar = function( vec, s, dest ) {
			if( !dest || vec === dest ) {
				vec[ 0 ] *= s
				vec[ 1 ] *= s
				return vec
			}

			dest[ 0 ] = vec[ 0 ] * s
			dest[ 1 ] = vec[ 1 ] * s
			return dest
		}

		/**
		 * Performs a vector addition
		 *
		 * @param {vec2} vec First operand
		 * @param {vec2} vec2 Second operand
		 * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec2} dest if specified, vec otherwise
		 */
		vec2.add = function( vec, vec2, dest ) {
			if( !dest || vec === dest ) {
				vec[ 0 ] += vec2 [0 ]
				vec[ 1 ] += vec2[ 1 ]
				return vec
			}

			dest[ 0 ] = vec[ 0 ] + vec2[ 0 ]
			dest[ 1 ] = vec[ 1 ] + vec2[ 1 ]
			return dest
		}

		/**
		 * Performs a vector subtraction
		 *
		 * @param {vec2} vec First operand
		 * @param {vec2} vec2 Second operand
		 * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec2} dest if specified, vec otherwise
		 */
		vec2.subtract = function( vec, vec2, dest ) {
			if( !dest || vec === dest ) {
				vec[ 0 ] -= vec2[ 0 ]
				vec[ 1 ] -= vec2[ 1 ]
				return vec
			}

			dest[ 0 ] = vec[ 0 ] - vec2[ 0 ]
			dest[ 1 ] = vec[ 1 ] - vec2[ 1 ]
			return dest
		}

		/**
		 * Performs subtraction of a vector with a scalar
		 *
		 * @param {vec2} vec First operand
		 * @param {number} s Second operand
		 * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec2} dest if specified, vec otherwise
		 */
		vec2.subtractScalar = function( vec, s, dest ) {
			if( !dest || vec === dest ) {
				vec[ 0 ] -= s
				vec[ 1 ] -= s
				return vec
			}

			dest[ 0 ] = vec[ 0 ] - s
			dest[ 1 ] = vec[ 1 ] - s
			return dest
		}

		/**
		 * Caclulates the dot product of two vec2s
		 *
		 * @param {vec2} vec First operand
		 * @param {vec2} vec2 Second operand
		 *
		 * @returns {number} Dot product of vec and vec2
		 */
		vec2.dot = function( vec, vec2 ) {
			return vec[ 0 ] * vec2[ 0 ] + vec[ 1 ] * vec2[ 1 ]
		}

		/**
		 * Caclulates the length of a vec2
		 *
		 * @param {vec2} vec vec2 to calculate length of
		 *
		 * @returns {number} Length of vec
		 */
		vec2.length = function( vec ) {
			var x = vec[ 0 ],
				y = vec[ 1 ]

			return Math.sqrt( x * x + y * y )
		}

		/**
		 * Generates a unit vector of the same direction as the provided vec2
		 * If vector length is 0, returns [0, 0]
		 *
		 * @param {vec2} vec vec2 to normalize
		 * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec2} dest if specified, vec otherwise
		 */
		vec2.normalize = function( vec, dest ) {
			if( !dest ) dest = vec

			var x = vec[ 0 ], y = vec[1],
				len = Math.sqrt( x * x + y * y )

			if( !len ) {
				dest[ 0 ] = 0
				dest[ 1 ] = 0
				return dest

			} else if( len === 1 ) {
				dest[ 0 ] = x
				dest[ 1 ] = y
				return dest
			}

			len = 1 / len
			dest[ 0 ] = x * len
			dest[ 1 ] = y * len
			return dest
		}

		/**
		 * Copies the values of one vec3 to another
		 *
		 * @param {vec2} vec vec2/vec3 containing values to copy
		 * @param {vec2} dest vec2 receiving copied values
		 *
		 * @returns {vec2} dest
		 */
		vec2.set = function( vec, dest ) {
			dest[ 0 ] = vec[ 0 ]
			dest[ 1 ] = vec[ 1 ]

			return dest
		}

		return vec2
	}
)

define(
	'spell/math/random/XorShift32',
	function() {
		'use strict'


		/**
		 * XorShift32 is a pseudo random number generator. It generates the next number in a sequence by repeatly applying a sequence of bit operations. You can use it
		 * to generate a sequence of random numbers. Since the algorithm is deterministic the generated sequence depends only on the chosen seed.
		 *
		 * Example:
		 *
		 *     // new instance of XorShift32 with seed 12345
		 *     var prng = new XorShift32( 12345 );
		 *
		 *     // always returns the same pseudo random number sequence depending on the seed
		 *     var number1 = prng.{@link #next}();
		 *     var number2 = prng.{@link #next}();
		 *
		 * @class spell.math.random.XorShift32
		 * @constructor
		 */
		var XorShift32 = function( seed ) {
			this.x = seed
		}

		XorShift32.prototype = {
			/**
			 * Returns the next number in the sequence.
			 *
			 * @return {Number}
			 */
			next : function() {
				var a = this.x,
					b = a

				a <<= 13
				b ^= a

				a >>= 17
				b ^= a

				a <<= 5
				b ^= a


				this.x = b

				return ( b + 2147483648 ) * ( 1 / 4294967296 )
			},

			/**
			 * Returns the next number between min and max in the sequence.
			 *
			 * @param {Number} min The minimum value
			 * @param {Number} max The maximum value
			 * @return {Number}
			 */
			nextBetween : function( min, max ) {
				return ( min + this.next() * ( max - min ) )
			}
		}

		return XorShift32
	}
)

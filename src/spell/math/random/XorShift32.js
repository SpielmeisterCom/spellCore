/**
 * Xorshift is a pseudorandom number generator. It generates the next number in
 * a sequence by repeatly taking the exclusive OR of a number with a bit shifted version of itself.
 *
 * You can use it to always generate the same sequence of random numbers depending of the choosen seed.
 *
 * Example:
 *
 *     var randomNumberGenerator = new XorShift32( 12345 );
 *     //=> new Instance of Xorshift with seed 12345
 *
 *     var randomNumber1 = randomNumberGenerator.{@link #next}();
 *     var randomNumber2 = randomNumberGenerator.{@link #next}();
 *
 *     //=> always returns the same random number sequence depending on the seed
 *
 * @class spell.math.random.XorShift32
 */

/**
 * Create a new instance of XorShift32 and initialize the seed with the given parameter.
 *
 * @param {Number} seed
 * @constructor
 */
define(
	'spell/math/random/XorShift32',
	function() {
		'use strict'

		var XorShift32 = function( seed ) {
			this.x = seed
		}

		/**
		 * Return the next pseudorandom number in the sequence
		 * @return {Number}
		 */
		XorShift32.prototype.next = function() {
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
			}

		/**
		 * Return the next pseudorandom number between min and max in the sequence
		 * @param {Number} min The minimum value
		 * @param {Number} max The maximum value
		 * @return {Number}
		 */
		XorShift32.prototype.nextBetween = function( min, max ) {
				return ( min + this.next() * ( max - min ) )
		}


		return XorShift32
	}
)

define(
	'spell/shared/util/random/XorShift32',
	function() {
		'use strict'


		var XorShift32 = function( seed ) {
			this.x = seed
		}

		XorShift32.prototype = {
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
			nextBetween : function( min, max ) {
				return ( min + this.next() * ( max - min ) )
			}
		}

		return XorShift32
	}
)

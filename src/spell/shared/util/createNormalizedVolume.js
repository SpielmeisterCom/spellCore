define(
	'spell/shared/util/createNormalizedVolume',
	[
		'spell/math/util'
	],
	function(
		mathUtil
	) {
		'use strict'

		return function( x ) {
			return x !== undefined ?
				mathUtil.clamp( x, 0, 1 ) :
				1
		}
	}
)

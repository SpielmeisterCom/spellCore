define(
	'spell/shared/util/xor',
	function() {
		'use strict'


		return function( a, b ) {
			return a ? !b : b
		}
	}
)

define(
	'spell/shared/util/platform/private/log',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return function( text ) {
			if( console.originalLog ) {
				console.originalLog( text )

			} else {
				console.log( text )
			}
		}
	}
)

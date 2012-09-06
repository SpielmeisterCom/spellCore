define(
	'spell/shared/util/platform/private/log',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


//		return _.bind( console.originalLog || console.log, console )
		return console.originalLog ?
			_.bind( console.originalLog, console ) :
			function( text ) {
				console.originalLog( text )
			}
	}
)

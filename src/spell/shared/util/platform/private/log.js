define(
	'spell/shared/util/platform/private/log',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return _.bind( console.log, console )
	}
)

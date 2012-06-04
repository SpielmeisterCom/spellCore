define(
	'spell/shared/util/platform/private/log',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		return _.bind( console.log, console )
	}
)

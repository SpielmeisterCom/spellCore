define(
	'spell/script/logger/sendLogRequest',
	[
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		PlatformKit,

		_
		) {
		'use strict'


		return function( url, data ) {
			PlatformKit.network.performHttpRequest(
				'POST',
				url,
				function() {},
				null,
				data
			)
		}
	}
)
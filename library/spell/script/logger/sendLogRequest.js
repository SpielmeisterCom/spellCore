define(
	'spell/script/logger/sendLogRequest',
	[
		'spell/shared/util/platform/PlatformKit'
	],
	function(
		PlatformKit
	) {
		'use strict'


		return function( url, data ) {
			PlatformKit.network.performHttpRequest(
				'POST',
				url,
				function() {},
				function() {},
				data
			)
		}
	}
)

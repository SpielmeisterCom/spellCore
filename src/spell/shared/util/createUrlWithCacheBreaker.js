define(
	'spell/shared/util/createUrlWithCacheBreaker',
	[
		'spell/shared/util/platform/Types'
	],
	function(
		Types
	) {
		'use strict'


		return function( url ) {
			return url + '?t=' + Types.Time.getCurrentInMs()
		}
	}
)

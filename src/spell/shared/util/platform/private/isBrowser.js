define(
	'spell/shared/util/platform/private/isBrowser',
	function() {
		'use strict'


		return !!( typeof window !== 'undefined' && navigator && document )
	}
)

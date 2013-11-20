define(
	'spell/shared/util/platform/private/environment/isBrowser',
	function() {
		'use strict'


		return !!( typeof window !== 'undefined' && navigator && document )
	}
)

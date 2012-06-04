define(
	'spell/shared/util/platform/private/createHost',
	function() {
		'use strict'


		return function() {
			return document.location.host
		}
	}
)

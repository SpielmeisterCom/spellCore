define(
	'spell/shared/util/platform/private/environment/isHtml5WinPhone',
	function() {
		'use strict'

		return window.external && typeof(window.external.notify ) !== 'undefined'
	}
)

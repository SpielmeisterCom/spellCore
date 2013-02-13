define(
	'spell/shared/util/platform/private/isHtml5Ejecta',
	function() {
		'use strict'


		var isHtml5Ejecta = typeof( ejecta ) !== 'undefined'

		return function() {
			return isHtml5Ejecta
		}
	}
)

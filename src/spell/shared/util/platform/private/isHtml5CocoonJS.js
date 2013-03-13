define(
	'spell/shared/util/platform/private/isHtml5CocoonJS',
	function() {
		'use strict'


		var isHtml5CocoonJS = typeof( CocoonJS ) === 'object'

		return function() {
			return isHtml5CocoonJS
		}
	}
)

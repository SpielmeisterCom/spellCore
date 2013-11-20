define(
	'spell/shared/util/platform/private/environment/isHtml5CocoonJS',
	function() {
		'use strict'


		return typeof( CocoonJS ) === 'object'
	}
)

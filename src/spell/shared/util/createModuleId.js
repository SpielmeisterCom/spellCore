define(
	'spell/shared/util/createModuleId',
	function() {
		'use strict'


		return function( scriptId ) {
			return scriptId.replace( /\./g, '/' )
		}
	}
)

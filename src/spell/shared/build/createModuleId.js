define(
	'spell/shared/build/createModuleId',
	function() {
		'use strict'


		return function( scriptId ) {
			return scriptId.replace( /\./g, '/' )
		}
	}
)

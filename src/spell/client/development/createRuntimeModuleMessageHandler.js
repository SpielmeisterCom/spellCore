define(
	'spell/client/development/createRuntimeModuleMessageHandler',
	[
		'spell/client/development/createMessageDispatcher'
	],
	function(
		createMessageDispatcher
	) {
		'use strict'


		return function( spell, startEngine ) {
			return createMessageDispatcher( {
				start : function( payload ) {
					var runtimeModule = payload.runtimeModule

					spell.runtimeModule = runtimeModule

					startEngine( runtimeModule, payload.cacheContent )
				}
			} )
		}
	}
)

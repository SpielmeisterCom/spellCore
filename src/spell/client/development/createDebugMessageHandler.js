define(
	'spell/client/development/createDebugMessageHandler',
	[
		'spell/client/development/createMessageDispatcher',
		'spell/client/development/createComponentMessageHandler',
		'spell/client/development/createEntityMessageHandler',
		'spell/client/development/createLibraryMessageHandler',
		'spell/client/development/createRuntimeModuleMessageHandler',
		'spell/client/development/createSettingsMessageHandler',
		'spell/client/development/createSystemMessageHandler'
	],
	function(
		createMessageDispatcher,
		createComponentMessageHandler,
		createEntityMessageHandler,
		createLibraryMessageHandler,
		createRuntimeModuleMessageHandler,
		createSettingsMessageHandler,
		createSystemMessageHandler
	) {
		'use strict'


		return function( spell, startEngine ) {
			return createMessageDispatcher(
				{
					'spelled.debug.component'     : createComponentMessageHandler( spell ),
					'spelled.debug.entity'        : createEntityMessageHandler( spell ),
					'spelled.debug.library'       : createLibraryMessageHandler( spell ),
					'spelled.debug.runtimeModule' : createRuntimeModuleMessageHandler( spell, startEngine ),
					'spelled.debug.settings'      : createSettingsMessageHandler( spell ),
					'spelled.debug.system'        : createSystemMessageHandler( spell )
				}
			)
		}
	}
)

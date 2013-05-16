define(
	'spell/client/development/createDebugMessageHandler',
	[
		'spell/client/development/createMessageDispatcher',
		'spell/client/development/createComponentMessageHandler',
		'spell/client/development/createEntityMessageHandler',
		'spell/client/development/createLibraryMessageHandler',
		'spell/client/development/createApplicationMessageHandler',
		'spell/client/development/createSettingsMessageHandler',
		'spell/client/development/createSystemMessageHandler'
	],
	function(
		createMessageDispatcher,
		createComponentMessageHandler,
		createEntityMessageHandler,
		createLibraryMessageHandler,
		createApplicationMessageHandler,
		createSettingsMessageHandler,
		createSystemMessageHandler
	) {
		'use strict'


		return function( spell, startEngine ) {
			return createMessageDispatcher( {
				'spell.debug.component'   : createComponentMessageHandler( spell ),
				'spell.debug.entity'      : createEntityMessageHandler( spell ),
				'spell.debug.library'     : createLibraryMessageHandler( spell ),
				'spell.debug.application' : createApplicationMessageHandler( spell, startEngine ),
				'spell.debug.settings'    : createSettingsMessageHandler( spell ),
				'spell.debug.system'      : createSystemMessageHandler( spell )
			} )
		}
	}
)

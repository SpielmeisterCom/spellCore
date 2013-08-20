define(
	'spell/client/development/createSystemMessageHandler',
	[
		'spell/client/development/createMessageDispatcher',
		'spell/shared/util/createId'
	],
	function(
		createMessageDispatcher,
		createId
	) {
		'use strict'


		return function( spell ) {
			return createMessageDispatcher( {
				add : function( payload ) {
					spell.sceneManager.addSystem( payload.systemId, payload.executionGroupId, payload.index, payload.systemConfig )
				},
				move : function( payload ) {
					spell.sceneManager.moveSystem( payload.systemId, payload.srcExecutionGroupId, payload.dstExecutionGroupId, payload.dstIndex )
				},
				remove : function( payload ) {
					spell.sceneManager.removeSystem( payload.systemId, payload.executionGroupId )
				},
				update : function( payload ) {
					var definition = payload.definition

					if( !definition.namespace || !definition.name ) {
						throw 'Error: System definition is missing namespace and or name attribute.'
					}

					var libraryId = createId( definition.namespace, definition.name )

					var metaDataCache = {}

					metaDataCache[ libraryId ] = definition

					spell.libraryManager.addToCache( metaDataCache )

					spell.sceneManager.restartSystem( libraryId, payload.executionGroupId, payload.systemConfig )
				}
			} )
		}
	}
)

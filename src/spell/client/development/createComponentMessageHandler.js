define(
	'spell/client/development/createComponentMessageHandler',
	[
		'spell/client/development/createMessageDispatcher'
	],
	function(
		createMessageDispatcher
	) {
		'use strict'


		return function( spell ) {
			return createMessageDispatcher( {
				add : function( payload ) {
					spell.entityManager.addComponent( payload.entityId, payload.componentId )
				},
				remove : function( payload ) {
					spell.entityManager.removeComponent( payload.entityId, payload.componentId )
				},
				update : function( payload ) {
					var success = spell.entityManager.updateComponent( payload.entityId, payload.componentId, payload.config )

					if( !success ) {
						spell.logger.error( 'Could not update component \'' + payload.componentId + '\' in entity ' + payload.entityId + '.' )
					}
				}
			} )
		}
	}
)

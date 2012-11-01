define(
	'spell/client/development/createEntityMessageHandler',
	[
		'spell/client/development/createMessageDispatcher'
	],
	function(
		createMessageDispatcher
	) {
		'use strict'


		return function( spell ) {
			return createMessageDispatcher(
				{
					'changeParent' : function( payload ) {
						spell.logger.error( 'The spelled.debug.entity.changeParent message handler is not yet implemented.' )
					},
					'create' : function( payload ) {
						spell.entityManager.createEntity( payload.entityConfig )
					},
					'remove' : function( payload ) {
						spell.entityManager.removeEntity( payload.entityId )
					}
				}
			)
		}
	}
)

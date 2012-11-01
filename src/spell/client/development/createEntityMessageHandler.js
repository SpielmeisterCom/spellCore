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
					'reassign' : function( payload ) {
						spell.entityManager.reassignEntity( payload.entityId, payload.parentEntityId )
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

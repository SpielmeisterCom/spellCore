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
			return createMessageDispatcher( {
				create : function( payload ) {
					spell.entityManager.createEntity( payload.entityConfig )
				},
				remove : function( payload ) {
					spell.entityManager.removeEntity( payload.entityId )
				}
			} )
		}
	}
)

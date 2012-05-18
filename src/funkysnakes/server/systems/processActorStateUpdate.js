define(
	'funkysnakes/server/systems/processActorStateUpdate',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		return function(
			clients,
			actorEntities
		) {
			_.each( clients, function( client, clientId ) {
				var actorStateUpdateMessages = client.messages.actorStateUpdate

				if( !actorStateUpdateMessages ||
					actorStateUpdateMessages.length === 0 ) {

					return
				}


				_.each( actorStateUpdateMessages, function( actorStateUpdateMessage ) {
					_.each( actorStateUpdateMessage, function( actionStateChange ) {
						_.each( actorEntities, function( actorEntity ) {
							var actor = actorEntity.actor

							if( actor.id !== clientId ) return


							actor.actions[ actionStateChange.id ].executing = actionStateChange.executing
						} )
					} )
				} )

				// clearing the processed buffer
				actorStateUpdateMessages.length = 0
			} )
		}
	}
)

define(
	'funkysnakes/server/systems/updatePlayers',
	[
		'funkysnakes/shared/config/constants',
		'funkysnakes/shared/config/players',
		'funkysnakes/server/util/createPlayer',
		'funkysnakes/server/util/getFreePlayerId',

		'spell/server/util/network/nextNetworkId',
		'spell/shared/util/network/Messages',

		'underscore'
	],
	function(
		constants,
		players,
		createPlayer,
		getFreePlayerId,

		nextNetworkId,
		Messages,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		/**
		 * Returns the player entity of the client with id clientId.
		 *
		 * @param entities
		 * @param clientId
		 * @return {*}
		 */
		var findPlayerEntity = function( entities, clientId ) {
			return _.find(
				entities,
				function( entity ) {
					return ( entity.player.clientId === clientId )
				}
			)
		}


		/**
		 * public
		 */

		return function(
			playerEntities,
			heads,
			clients,
			entityManager
		) {
			// remove the entities of players who disconnected
			_.each(
				playerEntities,
				function( player ) {
					var clientId = player.player.clientId
					if( clients[ clientId ] !== undefined ) return


					var head = heads[ clientId ]
					entityManager.removeComponent( head, 'active' )
					entityManager.destroyEntity( player )
				}
			)


			// add players who just joined
			_.each(
				clients,
				function( client, clientId ) {
					var player = findPlayerEntity( playerEntities, clientId )

					if( player ) return


					var freePlayerId = getFreePlayerId( playerEntities )

					createPlayer(
						entityManager,
						clientId,
						freePlayerId,
						players[ freePlayerId ]
					)

					client.send( Messages.ZONE_CHANGE, 'game' )
				}
			)
		}
	}
)

define(
	'funkysnakes/server/util/createPlayer',
	[
		'spell/server/util/network/nextNetworkId'
	],
	function(
		nextNetworkId
	) {
		'use strict'


		/**
		 * Creates all the necessary entities for the new player.
		 *
		 * @param entityManager
		 * @param clientId
		 * @param freePlayerId
		 * @param playerConfig
		 */
		var createPlayer = function( entityManager, clientId, freePlayerId, playerConfig ) {
			entityManager.createEntity(
				'player',
				[ {
					clientId : clientId,
					playerId : freePlayerId
				} ]
			)

			var head = entityManager.createEntity(
				'head',
				[ {
					headTextureId          : playerConfig.headTextureId,
					bodyTextureId          : playerConfig.bodyTextureId,
					speedTextureId         : playerConfig.speedTextureId,
					invincibilityTextureId : playerConfig.invincibilityTextureId,
					x                      : playerConfig.startX,
					y                      : playerConfig.startY,
					angle                  : playerConfig.startOrientation,
					clientId               : clientId,
					networkId              : nextNetworkId()
				} ]
			)
		}

		return createPlayer
	}
)

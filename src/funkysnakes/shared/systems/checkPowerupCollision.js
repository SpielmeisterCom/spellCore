define(
	"funkysnakes/shared/systems/checkPowerupCollision",
	[
		"funkysnakes/shared/config/constants",
		"funkysnakes/shared/util/collisionBetween",

		"spell/server/util/network/nextNetworkId",

		"underscore"
	],
	function(
		constants,
		collisionBetween,

		nextNetworkId,

		_
	) {
		"use strict"


		var tailElementDistance = constants.tailElementDistance

		var invincibilityDuration = 10


		var getPlayerId = function( playerEntites, clientId ) {
			var playerEntity = _.find(
				playerEntites,
				function( iterator ) {
					return ( iterator.player.clientId === clientId )
				}
			)

			return playerEntity.player.playerId
		}


		return function(
			heads,
			powerups,
			score,
			playerEntites,
			entityManager
		) {
			_.each( heads, function( head ) {
				_.each( powerups, function( powerup ) {
					if( !collisionBetween( head, powerup ) ) return


					if( powerup.powerup.type === "speed" &&
						powerup.assignedToPlayer.playerId === -1 ) {

						var playerId = getPlayerId( playerEntites, head.head.clientId )

						entityManager.createEntity(
							"speedPowerup",
							[ {
								type:      "speed",
								position:  [ 0, 0, 0 ],
								networkId: nextNetworkId(),
								playerId:  playerId,
								tailElement : {
									bodyId         : head.body.id,
									positionInTail : head.amountTailElements.value
								}
							} ]
						)

						entityManager.destroyEntity( powerup )


						head.amountTailElements.value += 1

					} else if( powerup.powerup.type === "spentSpeed" ) {
						if( head.head.invincibilityCountdown > 0 ) {
							entityManager.destroyEntity( powerup )

						} else if( head.hasOwnProperty( "shield" ) ) {
							entityManager.destroyEntity( powerup )
							head.shield.state = "activated"

						} else {
							entityManager.removeComponent( head, "active" )
						}

					} else if( powerup.powerup.type === "invincibility" ) {
						entityManager.destroyEntity( powerup )

						head.head.invincibilityCountdown += invincibilityDuration

						head.activePowerups[ "invincibility" ] = true

					} else if( powerup.powerup.type === "shield" ) {
						entityManager.destroyEntity( powerup )

						entityManager.addComponent( head, "shield", [ { } ] )
					}
				} )
			} )
		}
	}
)

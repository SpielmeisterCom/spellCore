define(
	"funkysnakes/shared/systems/checkTailCollision",
	[
		"funkysnakes/shared/util/collisionBetween",

		"spell/server/util/network/nextNetworkId",
		"spell/shared/util/map",

		"glmatrix/vec3",
		"underscore"
	],
	function(
		collisionBetween,

		nextNetworkId,
		map,

		vec3,
		_
	) {
		"use strict"


		return function(
			heads,
			tailElements,
			tailElementsByHeadId,
			entityManager
		) {
			_.each( heads, function( head ) {
				var collidingTailElement = _.find(
					tailElements,
					function( tailElement ) {
						return collisionBetween( head, tailElement )
					}
				)

				if( collidingTailElement === undefined ) return


				if ( head.head.invincibilityCountdown === 0 ) {
					if( head.hasOwnProperty( "shield" ) ) {
						head.shield.state = "activated"

					} else {
						entityManager.removeComponent( head, "active" )
					}

					return
				}


				var tailElementsToRemoveFromTail = []

				var tailElementsForHead = tailElementsByHeadId[ collidingTailElement.tailElement.bodyId ]
				_.each( tailElementsForHead, function( element ) {
					if ( element.tailElement.positionInTail >= collidingTailElement.tailElement.positionInTail ) {
						tailElementsToRemoveFromTail.push( element.id )
					}
				} )

				head.amountTailElements.value -= tailElementsToRemoveFromTail.length

				_.each( tailElementsToRemoveFromTail, function( id ) {
					var tailElement = tailElements[ id ]

					var entity = entityManager.createEntity(
						"speedPowerup",
						[ {
							type:      "speed",
							position:  tailElement.position,
							networkId: nextNetworkId()
						} ]
					)

					entityManager.destroyEntity( tailElement )
				} )
			} )
		}
	}
)

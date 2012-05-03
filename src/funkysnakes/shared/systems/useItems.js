define(
	"funkysnakes/shared/systems/useItems",
	[
		"funkysnakes/shared/config/constants",

		"spell/server/util/network/nextNetworkId",

		"underscore"
	],
	function(
		constants,

		nextNetworkId,

		_
	) {
		"use strict"


		var speedPowerupBonus    = constants.speedPowerupBonus
		var speedPowerupDuration = 2


		return function(
			heads,
			tailElements,
			entityManager
		) {
			_.each( heads, function( head ) {
				var actions = head.actor.actions

				if( actions[ "useItem" ].executing !== true ) return


				actions[ "useItem" ].executing = false

				var tailElementsForHead = tailElements[ head.body.id ]

				if( _.size( tailElementsForHead ) > 0 ) {
					tailElementsForHead.sort( function( tailElementA, tailElementB ) {
						return tailElementA.tailElement.positionInTail - tailElementB.tailElement.positionInTail
					} )

					var elementToRemove = tailElementsForHead.pop()
					head.amountTailElements.value -= 1


					var entity = entityManager.createEntity(
						"speedPowerup",
						[ {
							type:      "spentSpeed",
							position:  elementToRemove.position,
							networkId: nextNetworkId()
						} ]
					)

					entityManager.destroyEntity( elementToRemove )


					// apply speed bonus
					head.head.speedBonus += speedPowerupBonus
					head.head.bonusCountdowns.push( speedPowerupDuration )

					head.activePowerups.speed = true
				}
			} )
		}
	}
)

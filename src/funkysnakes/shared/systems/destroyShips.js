define(
	"funkysnakes/shared/systems/destroyShips",
	[
		"spell/server/util/network/nextNetworkId",

		"underscore"
	],
	function(
		nextNetworkId,

		_
	) {
		"use strict"


		var destroyShip = function( head, tailElementsOfHead, entityManager ) {
			_.each( tailElementsOfHead, function( element ) {
				entityManager.createEntity(
					"speedPowerup",
					[ {
						type:      "speed",
						position:  element.position,
						networkId: nextNetworkId()
					} ]
				)

				entityManager.destroyEntity( element )
			} )
		}
		
		return function(
			heads,
			tailElementsByHeadId,
			entityManager
		) {
			_.each( heads, function( head ) {
				if( head.hasOwnProperty( "active" ) ) return

				
				destroyShip(
					head,
					tailElementsByHeadId[ head.body.id ],
					entityManager
				)
			} )
		}
	}
)

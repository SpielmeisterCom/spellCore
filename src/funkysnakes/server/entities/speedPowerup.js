define(
	"funkysnakes/server/entities/speedPowerup",
	[
		"funkysnakes/shared/components/collisionCircle",
		"funkysnakes/shared/components/position",
		"funkysnakes/shared/components/powerup",
		"funkysnakes/shared/components/assignedToPlayer",
		"funkysnakes/shared/components/tailElement",

		"spell/server/components/network/synchronizationMaster"
	],
	function(
		collisionCircle,
		position,
		powerup,
		assignedToPlayer,
		tailElement,

		synchronizationMaster
	) {
		"use strict"


		return function( args ) {
			this.synchronizationMaster = new synchronizationMaster( {
				id        : args.networkId,
				components: [ "position", "tailElement" ]
			} )

			this.collisionCircle  = new collisionCircle( 5 )
			this.position         = new position( args.position )
			this.powerup          = new powerup( { type: args.type } )
			this.assignedToPlayer = new assignedToPlayer( args.playerId )

			if( args.tailElement ) {
				this.tailElement = new tailElement( args.tailElement )
			}
		}
	}
)

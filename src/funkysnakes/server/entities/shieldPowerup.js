define(
	"funkysnakes/server/entities/shieldPowerup",
	[
		"funkysnakes/shared/components/collisionCircle",
		"funkysnakes/shared/components/position",
		"funkysnakes/shared/components/powerup",

		"spell/server/components/network/synchronizationMaster"
	],
	function(
		collisionCircle,
		position,
		powerup,

		synchronizationMaster
	) {
		"use strict"


		return function( args ) {
			this.synchronizationMaster = new synchronizationMaster( {
				id        : args.networkId,
				components: [ "position" ]
			} )

			this.collisionCircle = new collisionCircle( 18 )
			this.position        = new position( args.position )
			this.powerup         = new powerup( { type: args.type } )
		}
	}
)

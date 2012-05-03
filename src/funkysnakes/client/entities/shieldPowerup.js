define(
	"funkysnakes/client/entities/shieldPowerup",
	[
		"funkysnakes/client/components/appearance",
		"funkysnakes/client/components/networkInterpolation",
		"funkysnakes/client/components/renderData",
		"funkysnakes/shared/components/position",

		"spell/client/components/network/synchronizationSlave"
	],
	function(
		appearance,
		networkInterpolation,
		renderData,
		position,

		synchronizationSlave
	) {
		"use strict"


		return function( args ) {
			this.appearance = new appearance( {
				textureId : "items/object_energy.png",
				offset    : [ -24, -24 ]
			} )

			this.networkInterpolation = new networkInterpolation()
			this.position             = new position( args.position )
			this.renderData           = new renderData( { pass: 5 } )
			this.synchronizationSlave = new synchronizationSlave( { id: args.networkId } )
		}
	}
)

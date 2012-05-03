define(
	"funkysnakes/client/entities/invincibilityPowerup",
	[
		"funkysnakes/client/components/appearance",
		"funkysnakes/client/components/networkInterpolation",
		"funkysnakes/client/components/renderData",
		"funkysnakes/client/components/shadowCaster",
		"funkysnakes/shared/components/position",

		"spell/client/components/network/synchronizationSlave"
	],
	function(
		appearance,
		networkInterpolation,
		renderData,
		shadowCaster,
		position,

		synchronizationSlave
	) {
		"use strict"


		return function( args ) {
			this.appearance = new appearance( {
				textureId : "items/invincible.png",
				offset    : [ -23, -24 ]
			} )

			this.shadowCaster = new shadowCaster( {
				textureId: "shadows/invincible.png"
			} )

			this.networkInterpolation = new networkInterpolation()
			this.position             = new position( args.position )
			this.renderData           = new renderData( { pass: 5 } )
			this.synchronizationSlave = new synchronizationSlave( { id: args.networkId } )
		}
	}
)

define(
	"funkysnakes/client/entities/cloud",
	[
		"funkysnakes/client/components/appearance",
		"funkysnakes/client/components/cloud",
		"funkysnakes/client/components/renderData",
		"funkysnakes/shared/components/position"
	],
	function(
		appearance,
		cloud,
		renderData,
		position
	) {
		"use strict"


		return function( args ) {
			this.appearance = new appearance( {
				scale:     args.scale,
				textureId: args.textureId
			} )

			this.cloud = new cloud( {
				speed: args.speed
			} )

			this.renderData = new renderData( {
				pass: args.pass
			} )

			this.position = new position( args.position )
		}
	}
)

define(
	"funkysnakes/client/entities/arena",
	[
		"funkysnakes/client/components/appearance",
		"funkysnakes/client/components/renderData",
		"funkysnakes/shared/components/position"
	],
	function(
		appearance,
		renderData,
		position
	) {
		"use strict"


		return function() {
			this.appearance = new appearance( { textureId: "environment/arena.png" } )
			this.position   = new position( [ 5, 18, 0 ] )
			this.renderData = new renderData( { pass: 3 } )
		}
	}
)

define(
	"funkysnakes/client/entities/widget",
	[
		"funkysnakes/client/components/appearance",
		"funkysnakes/shared/components/position",
		"funkysnakes/client/components/renderData"
	],
	function(
		appearance,
		position,
		renderData
	) {
		"use strict"


		return function( args ) {
			this.appearance = new appearance( {
				scale     : args.scale,
				textureId : args.textureId
			} )

			this.position   = new position( args.position || [ 0, 0, 0 ] )
			this.renderData = new renderData( { pass: 100 } ) // "100" means render it in the last pass
		}
	}
)

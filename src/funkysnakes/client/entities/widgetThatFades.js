define(
	"funkysnakes/client/entities/widgetThatFades",
	[
		"funkysnakes/client/components/appearance",
		"funkysnakes/client/components/fade",
		"funkysnakes/shared/components/position",
		"funkysnakes/client/components/renderData"
	],
	function(
		appearance,
		fade,
		position,
		renderData
	) {
		"use strict"


		return function( args ) {
			this.appearance = new appearance( {
				scale     : args.scale,
				textureId : args.textureId
			} )

			this.position = new position( args.position || [ 0, 0, 0 ] )

			this.renderData = new renderData( {
				pass    : 100, // "100" means render it in the last pass
				opacity : ( args.opacity !== undefined ? args.opacity : 1.0 )
			} )

			this.fade = new fade( args.fade )
		}
	}
)

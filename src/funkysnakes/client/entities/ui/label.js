define(
	"funkysnakes/client/entities/ui/label",
	[
		"funkysnakes/shared/components/position",
		"funkysnakes/client/components/renderData",
        "funkysnakes/client/components/ui/text"
	],
	function(
		position,
		renderData,
        text
	) {
		"use strict"


		return function( args ) {

            this.text = new text( args.text )

			this.position = new position( args.position || [ 0, 0, 0 ] )

			this.renderData = new renderData( {
				pass    : 150,
				opacity : 1.0
			} )

		}
	}
)

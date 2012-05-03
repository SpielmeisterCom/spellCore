define(
	"funkysnakes/client/entities/ui/container",
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

            if( !!args.textureId ) {
                this.appearance = new appearance( {
                    scale     : args.scale,
                    textureId : args.textureId
                } )
            }

			this.position = new position( args.position || [ 0, 0, 0 ] )

			this.renderData = new renderData( {
				pass    : 110,
				opacity : ( args.opacity !== undefined ? args.opacity : 1.0 )
			} )

		}
	}
)

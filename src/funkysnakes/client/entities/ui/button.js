define(
	"funkysnakes/client/entities/ui/button",
	[
		"funkysnakes/client/components/appearance",
		"funkysnakes/shared/components/position",
		"funkysnakes/client/components/renderData",
        "funkysnakes/client/components/ui/clickable",
        "funkysnakes/client/components/ui/on",
        "spell/client/components/boundingBox"
	],
	function(
		appearance,
		position,
		renderData,
        clickable,
        on,
        boundingBox
	) {
		"use strict"


		return function( args ) {
			this.appearance = new appearance( {
				textureId : args.textureId
			} )

            this.boundingBox = new boundingBox( {
                x       : args.boundingBox.x,
                y       : args.boundingBox.y,
                width   : args.boundingBox.width,
                height  : args.boundingBox.height
            } )

            if( args.enableToggle !== undefined && args.enableToggle === true ) {
                this.on = new on( args.on )
            }

            this.clickable = new clickable()

			this.position = new position( args.position || [ 0, 0, 0 ] )

			this.renderData = new renderData( {
				pass    : 110,
				opacity : ( args.opacity !== undefined ? args.opacity : 1.0 )
			} )

		}
	}
)

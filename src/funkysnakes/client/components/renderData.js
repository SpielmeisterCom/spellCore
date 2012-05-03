define(
	"funkysnakes/client/components/renderData",
	function() {
		"use strict"


		return function( args ) {
			this.position    = [ 0, 0, 0 ]
			this.orientation = 0
			this.scale       = [ 1, 1 ]

			/**
			 * The render pass the entity is rendered in. Lower number means earlier rendering in the render process.
			 */
			this.pass = ( args.pass !== undefined ? args.pass : 0 )

			this.opacity = ( args.opacity !== undefined ? args.opacity : 1.0 )
		}
	}
)

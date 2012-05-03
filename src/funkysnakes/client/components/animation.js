define(
	"funkysnakes/client/components/animation",
	function() {
		"use strict"
		
		
		return function( args ) {
			this.id                = args.id
			this.positionOffset    = [ 0, 0 ]
			this.orientationOffset = 0
		}
	}
)

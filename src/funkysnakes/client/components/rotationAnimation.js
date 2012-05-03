define(
	"funkysnakes/client/components/rotationAnimation",
	function() {
		"use strict"
		
		
		return function( args ) {
			this.offsetInRad   = args.offsetInRad
			this.rotationsPerS = args.rotationsPerS
		}
	}
)

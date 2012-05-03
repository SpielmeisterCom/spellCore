define(
	"funkysnakes/client/components/hoverAnimation",
	function() {
		"use strict"
		
		
		return function( args ) {
			this.amplitude  = args.amplitude
			this.frequency  = args.frequency
			this.offsetInMs = args.offsetInMs || 0
		}
	}
)

define(
	"funkysnakes/shared/components/shield",
	[
		"funkysnakes/shared/config/constants"
	],
	function(
		constants
	) {
		"use strict"
		
		
		return function( args ) {
			this.state = args.state
			this.lifetime = args.lifetime || constants.shieldLifetime // in seconds
		}
	}
)

define(
	"spell/server/components/player",
	function() {
		"use strict"
		
		
		return function( args ) {
			this.clientId = args.clientId

			// the internal id of the player
			this.playerId = args.playerId
		}
	}
)

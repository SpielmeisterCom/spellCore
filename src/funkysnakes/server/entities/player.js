define(
	"funkysnakes/server/entities/player",
	[
		"spell/server/components/player",
		'spell/shared/components/actor'
	],
	function(
		player,
		actor
	) {
		"use strict"


		return function( args ) {
			this.actor  = new actor( args.clientId, [ "left", "right", "useItem" ] )
			this.player = new player( args )
		}
	}
)

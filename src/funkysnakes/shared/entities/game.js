define(
	"funkysnakes/shared/entities/game",
	[
		"funkysnakes/shared/components/game"
	],
	function(
		game
	) {
		"use strict"


		return function( args ) {
			this.game = new game( args )
		}
	}
)

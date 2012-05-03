define(
	"funkysnakes/client/entities/scoreDisplay",
	[
		"funkysnakes/shared/components/position",
		"funkysnakes/shared/components/scoreDisplay",
		"funkysnakes/shared/components/text"
	],
	function(
		position,
		scoreDisplay,
		text
	) {
		"use strict"
		
		
		return function( position, playerId, textColor ) {
			this.position     = new position( position )
			this.scoreDisplay = new scoreDisplay( playerId )
			this.text         = new text( "", textColor )
		}
	}
)

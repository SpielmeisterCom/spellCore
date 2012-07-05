define(
	"funkysnakes/client/systems/updateScoreDisplays",
	[
		'spell/functions'
	],
	function(
		_
	) {
		"use strict"


		return function( heads, scoreDisplays ) {
			_.each( heads, function( head ) {
				_.each( scoreDisplays, function( display ) {
					if ( head.body.id === display.scoreDisplay.playerId ) {
						display.text.value = "Apples: " + head.score.value
					}
				} )
			} )
		}
	}
)

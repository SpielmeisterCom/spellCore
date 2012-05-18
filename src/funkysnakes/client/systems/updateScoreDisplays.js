define(
	"funkysnakes/client/systems/updateScoreDisplays",
	[
		'spell/shared/util/platform/underscore'
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

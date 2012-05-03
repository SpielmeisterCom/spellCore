define(
	"funkysnakes/shared/systems/updateSpaceshipOrientation",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"


		var turningSpeedInRadPerSecond = 3.5


		return function( dtInSeconds, heads ) {
			_.each( heads, function( head ) {
				head.orientation.angle += head.turningDirection.value * turningSpeedInRadPerSecond * dtInSeconds
			} )
		}
	}
)

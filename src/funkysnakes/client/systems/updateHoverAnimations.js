define(
	"funkysnakes/client/systems/updateHoverAnimations",
	[
		'spell/functions'
	],
	function(
		_
	) {
		"use strict"


		return function(
			timeInMs,
			hoverAnimations
		) {
			_.each( hoverAnimations, function( entity ) {
				var amplitude  = entity.hoverAnimation.amplitude
				var frequency  = entity.hoverAnimation.frequency
				var offsetInMs = entity.hoverAnimation.offsetInMs

				var yPositionOffset = Math.floor( Math.sin( ( timeInMs + offsetInMs ) * frequency ) * amplitude )

				entity.animation.positionOffset[ 1 ] = yPositionOffset
			} )
		}
	}
)

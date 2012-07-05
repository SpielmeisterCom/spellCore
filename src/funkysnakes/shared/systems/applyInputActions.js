define(
	"funkysnakes/shared/systems/applyInputActions",
	[
		'spell/functions'
	],
	function(
		_
	) {
		"use strict"


		return function( heads ) {
			_.each( heads, function( head ) {
				var actions = head.actor.actions

				if( actions[ "left" ].executing === true ) {
					head.turningDirection.value = -1

 				} else if( actions[ "right" ].executing === true ) {
					head.turningDirection.value = 1

				} else {
					head.turningDirection.value = 0
				}
			} )
		}
	}
)

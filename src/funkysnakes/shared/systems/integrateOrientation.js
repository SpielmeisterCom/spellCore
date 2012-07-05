define(
	"funkysnakes/shared/systems/integrateOrientation",
	[
		'spell/functions'
	],
	function(
		_
	) {
		"use strict"


		return function(
			deltaTimeInS,
			entities
		) {
			_.each( entities, function( entity ) {
				entity.orientation.angle += entity.angularFrequency.radPerS * deltaTimeInS
			} )
		}
	}
)

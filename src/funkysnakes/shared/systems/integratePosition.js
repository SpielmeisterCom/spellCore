define(
	"funkysnakes/shared/systems/integratePosition",
	[
		"funkysnakes/shared/config/constants",
		"funkysnakes/shared/util/speedOf",

		"glmatrix/vec3",
		"underscore"
	],
	function(
		constants,
		speedOf,

		vec3,
		_
	) {
		"use strict"


		return function( dtInSeconds, heads ) {
			_.each( heads, function( head ) {
				var angle    = head.orientation.angle
				var speed    = Math.max( 20, speedOf( head ) )
				var movement = speed * dtInSeconds

				var dx = Math.sin( angle ) * movement
				var dy = Math.cos( angle ) * movement

				vec3.add( head.position, vec3.create( [ dx, dy, 0 ] ) )
			} )
		}
	}
)

define(
	"funkysnakes/shared/util/collisionBetween",
	[
		"spell/math/vec3"
	],
	function(
		vec3
	) {
		"use strict"


		return function( a, b ) {
			var distanceVector = vec3.create()
			vec3.subtract( a.position, b.position, distanceVector )
			var distance = vec3.length( distanceVector )

			return distance < a.collisionCircle.radius + b.collisionCircle.radius
		}
	}
)

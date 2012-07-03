define(
	"funkysnakes/shared/components/position",
	[
		"spell/math/vec3"
	],
	function(
		vec3
	) {
		"use strict"


		return function( pos ) {
			return vec3.create( pos )
		}
	}
)

define(
	"funkysnakes/shared/components/position",
	[
		"glmatrix/vec3"
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

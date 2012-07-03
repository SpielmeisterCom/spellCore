define(
	"funkysnakes/client/components/cloud",
	[
		"spell/math/vec3"
	],
	function(
		vec3
	) {
		"use strict"


		return function( args ) {
			this.speed = ( args.speed !== undefined ? vec3.create( args.speed ) : [ 0, 0, 0 ] )
		}
	}
)

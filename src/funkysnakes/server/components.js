define(
	"funkysnakes/server/components",
	[
		"funkysnakes/shared/components/powerup",
		"funkysnakes/shared/components/tailElement",
		"funkysnakes/shared/components/shield"
	],
	function(
		powerup,
		tailElement,
		shield
	) {
		"use strict"
		
		
		return {
			"powerup"    : powerup,
			"tailElement": tailElement,
			"shield"     : shield
		}
	}
)

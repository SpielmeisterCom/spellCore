define(
	"funkysnakes/shared/components/body",
	function() {
		"use strict"


		return function( id ) {
			this.id = id
			this.pastPositions = []
			this.distanceCoveredSinceLastSavedPosition = 0
		}
	}
)

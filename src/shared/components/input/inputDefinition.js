define(
	"spell/shared/components/input/inputDefinition",
	function() {
		"use strict"


		return function( actorId, mapping ) {
			this.actorId                = actorId
			this.keyCodeToActionMapping = mapping
		}
	}
)

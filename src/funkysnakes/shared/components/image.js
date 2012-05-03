define(
	"funkysnakes/shared/components/image",
	function() {
		"use strict"
		
		
		return function( id, xOffset, yOffset ) {
			this.id     = id,
			this.offset = [ xOffset, yOffset ]
		}
	}
)

define(
	"spell/client/components/boundingBox",
	function() {
		"use strict"

		var boundingBox = function( args ) {
            this.x        = args.x
            this.y        = args.y
            this.width    = args.width
            this.height   = args.height
		}

		return boundingBox
	}
)

define(
	"funkysnakes/client/components/fade",
	function() {
		"use strict"


		return function( args ) {
			this.beginAfter = args.beginAfter
			this.duration   = args.duration
			this.age        = 0
			this.start      = ( args.start !== undefined ? args.start : 1.0 )
			this.end        = ( args.end !== undefined ? args.end : 0.0 )
		}
	}
)

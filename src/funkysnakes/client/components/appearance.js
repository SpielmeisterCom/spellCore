define(
	"funkysnakes/client/components/appearance",
	function() {
		"use strict"


		return function( args ) {
			this.textureId = args.textureId
			this.offset    = ( args.offset !== undefined ? [ args.offset[ 0 ], args.offset[ 1 ], 0 ] : [ 0, 0, 0 ] )
			this.scale     = ( args.scale !== undefined ? [ args.scale[ 0 ], args.scale[ 1 ], 0 ] : [ 1, 1, 0 ] )
			this.color     = args.color || [ 1.0, 0.0, 1.0 ]
			this.opacity   = 1.0
		}
	}
)

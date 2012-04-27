define(
	"spell/shared/util/platform/private/createNativeFloatArray",
	function() {
		"use strict"


		var arrayType = ( ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array )

		return function( length ) {
			return new arrayType( length )
		}
	}
)

define(
	'spell/shared/util/platform/private/nativeType/createFloatArray',
	[
		'spell/shared/util/platform/private/nativeType/hasFloatArraySupport'
	],
	function(
		hasFloatArraySupport
	) {
		'use strict'

		return function( length ) {

			var array

			if( hasFloatArraySupport() ) {

				array = new Float32Array( length )

			} else {

				array = new Array( length )
				for( var i=0; i < length; i++ ) {
					array[ i ] = 0
				}
			}

			return array
		}
	}
)

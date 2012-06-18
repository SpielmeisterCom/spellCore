define(
	'spell/shared/util/platform/private/nativeType/createFloatArray',
	[
		'spell/shared/util/platform/private/nativeType/hasFloatArraySupport'
	],
	function(
		hasFloatArraySupport
	) {
		'use strict'


		var arrayType = ( hasFloatArraySupport() ? Float32Array : Array )

		return function( length ) {
			return new arrayType( length )
		}
	}
)

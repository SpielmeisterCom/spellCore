define(
	'spell/shared/util/platform/private/nativeType/createIntegerArray',
	[
		'spell/shared/util/platform/private/nativeType/hasIntegerArraySupport'
	],
	function(
		hasIntegerArraySupport
	) {
		'use strict'


		var arrayType = ( hasIntegerArraySupport() ? Int32Array : Array )

		return function( length ) {
			return new arrayType( length )
		}
	}
)

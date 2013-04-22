define(
	'spell/shared/util/platform/private/nativeType/Int32Array',
	function() {
		'use strict'


		var isSupported = typeof( Int32Array ) !== 'undefined',
			arrayType   = isSupported ? Int32Array : Array

		return {
			isSupported : function() {
				return isSupported
			},
			create : function( length ) {
				return new arrayType( length )
			}
		}
	}
)

define(
	'spell/shared/util/platform/private/nativeType/Int8Array',
	function() {
		'use strict'


		var isSupported = typeof( Int8Array ) !== 'undefined',
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

define(
	'spell/shared/util/platform/private/nativeType/Int8Array',
	function() {
		'use strict'


		var isSupported = typeof( Int8Array ) !== 'undefined',
			arrayType   = isSupported ? Int8Array : Array

		return {
			isSupported : function() {
				return isSupported
			},
			create : function( length ) {
				return new arrayType( length )
			},
			fromValues : function( values ) {
				return isSupported ?
					new arrayType( values ) :
					values.slice( 0 )
			}
		}
	}
)

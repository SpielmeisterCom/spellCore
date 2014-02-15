define(
	'spell/shared/util/platform/private/nativeType/Uint16Array',
	function() {
		'use strict'


		var isSupported = typeof( Uint16Array ) !== 'undefined',
			arrayType   = isSupported ? Uint16Array : Array

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

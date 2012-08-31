define(
	'spell/shared/util/deepClone',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return function deepClone( o, preserveUnclonableTypeReferences ) {
			if( !o ) return o

			var isArray    = _.isArray( o ),
				isClonable = isArray || o.toString() !== '[object WebGLTexture]'

			if( !isClonable ) {
				return preserveUnclonableTypeReferences ? o : {}
			}

			if( isArray ||
				_.isObject( o ) ) {

				var clone = isArray ? [] : {}

				_.each( o, function( value, key ) {
					clone[ key ] = deepClone( value, preserveUnclonableTypeReferences )
				} )

				return clone

			} else {
				return o
			}
		}
	}
)

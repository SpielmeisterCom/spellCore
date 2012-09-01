define(
	'spell/shared/util/deepClone',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return function deepClone( o ) {
			var isArray = _.isArray( o )

			if( isArray ||
				_.isObject( o ) ) {

				var clone = isArray ? [] : {}

				_.each( o, function( value, key ) {
					clone[ key ] = deepClone( value )
				} )

				return clone

			} else {
				return o
			}
		}
	}
)

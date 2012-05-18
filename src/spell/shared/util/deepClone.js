define(
	'spell/shared/util/deepClone',
	[
		'spell/shared/util/platform/underscore'
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

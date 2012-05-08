define(
	'spell/shared/util/deepClone',
	[
		'underscore'
	],
	function(
		_
	) {
		'use strict'


		return function deepClone( o ) {
			if (
				_.isBoolean( o )   ||
				_.isFunction( o )  ||
				_.isNaN( o )       ||
				_.isNull( o )      ||
				_.isNumber( o )    ||
				_.isString( o )    ||
				_.isUndefined( o )
			) {
				return o

			} else {
				var clone = _.isArray( o ) ? [] : {}

				_.each( o, function( value, key ) {
					clone[ key ] = deepClone( value )
				} )

				return clone
			}
		}
	}
)

define(
	'spell/shared/util/createEnumesqueObject',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		/*
		 * Creates an object with the properties defined by the array "keys". Each property has a unique Number.
		 */
		return function( keys ) {
			return _.reduce(
				keys,
				function( memo, key ) {
					memo.result[ key ] = memo.index++

					return memo
				},
				{
					index  : 0,
					result : {}
				}
			).result
		}
	}
)

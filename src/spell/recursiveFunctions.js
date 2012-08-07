/**
 * @class spell.recurisveFunctions
 * @singleton
 */
define(
	'spell/recursiveFunctions',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		/**
		 * Performs a recursive walk over all properties of the supplied object. The "object" argument can be either of type object or array. The iterator
		 * argument is called with the arguments "key" and "value" for every property that is encountered on the walk.
		 *
		 * @param {*} object data structure to work on
		 * @param {Function} iterator
		 */
		var walk = function( object, iterator ) {
			for( var key in object ) {
				var value = object[ key ]

				if( _.isObject( value ) ) {
					walk( value, iterator )

				} else {
					iterator( key, value )
				}
			}
		}

		/**
		 * Performs a recursive pluck. All keys of the supplied object argument which are encountered during a recursive walk are checked for their existence
		 * in the properties argument array. If a match is found it is stored in the result array.
		 *
		 * @param {*} object data structure to work on
		 * @param {Array} properties array of strings
		 * @return {Array}
		 */
		var pluck = function( object, properties ) {
			var result = []

			walk(
				object,
				function( key, value ) {
					if( !_.contains( properties, key ) ) return

					result.push( value )
				}
			)

			return result
		}

		return {
			walk : walk,
			pluck : pluck
		}
	}
)

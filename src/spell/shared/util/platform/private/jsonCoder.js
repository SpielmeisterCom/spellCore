define(
	'spell/shared/util/platform/private/jsonCoder',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		/**
		 * Creates a string encoded json data structure out of a json data structure.
		 */
		var encode = _.bind( JSON.stringify, JSON )

		/**
		 * Creates a json data structure out of a string encoded json data structure.
		 */
		var decode = _.bind( JSON.parse, JSON )

		return {
			encode : encode,
			decode : decode
		}
	}
)

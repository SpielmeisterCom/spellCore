define(
	'spell/shared/util/arrayRemove',
	function() {
		'use strict'


		// Array Remove - By John Resig (MIT Licensed)
		var arrayRemove = function( array, from, to ) {
			var rest = array.slice( ( to || from ) + 1 || array.length )

			array.length = from < 0 ? array.length + from : from

			return array.push.apply( array, rest )
		}

		return arrayRemove
	}
)

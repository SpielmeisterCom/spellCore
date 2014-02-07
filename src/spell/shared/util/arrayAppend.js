define(
	'spell/shared/util/arrayAppend',
	function() {
		'use strict'


		return function( array, otherArray ) {
			otherArray.forEach( function( v ) { array.push( v ) }, this )

			return array
		}
	}
)

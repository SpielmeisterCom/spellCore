define(
	'spell/shared/util/createLibraryFilePathFromId',
	function() {
		'use strict'


		return function( id ) {
			return id.replace( /\./g, '/' ) + '.json'
		}
	}
)

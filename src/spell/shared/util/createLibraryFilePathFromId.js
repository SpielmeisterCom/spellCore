define(
	'spell/shared/util/createLibraryFilePathFromId',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return function( id ) {
			return id.replace( /\./g, '/' ) + '.json'
		}
	}
)

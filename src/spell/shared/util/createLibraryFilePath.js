define(
	'spell/shared/util/createLibraryFilePath',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return function( namespace, fileName ) {
			return namespace.replace( /\./g, '/' ) + '/' + fileName
		}
	}
)

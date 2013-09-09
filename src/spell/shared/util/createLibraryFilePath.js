define(
	'spell/shared/util/createLibraryFilePath',
	function() {
		'use strict'


		return function( namespace, fileName ) {
			return namespace.replace( /\./g, '/' ) + '/' + fileName
		}
	}
)

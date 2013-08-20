define(
	'spell/shared/util/createIdFromLibraryFilePath',
	function() {
		'use strict'


		return function( libraryFilePath, asArray ) {
			// strip the file extension
			var tmp = libraryFilePath.substr( 0, libraryFilePath.lastIndexOf( '.' ) )

			return asArray ?
				tmp.split( '/' ) :
				tmp.replace( /\//g, '.' )
		}
	}
)

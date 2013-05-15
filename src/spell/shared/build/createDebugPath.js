define(
	'spell/shared/build/createDebugPath',
	[
		'fs',
		'path'
	],
	function(
		fs,
		path
	) {
		'use strict'


		/**
		 * Returns the debugPath if tryDebugPath is true and the debug path exists. Otherwise the releasePath is returned.
		 */
		return function( tryDebugPath, debugPath, releasePath, basePath ) {
			var filePath

			if( tryDebugPath ) {
				filePath = basePath ? path.join( basePath, debugPath ) : debugPath

				if( fs.existsSync( filePath ) ) {
					return filePath
				}
			}

			filePath = basePath ? path.join( basePath, releasePath ) : releasePath

			if( fs.existsSync( filePath ) ) {
				return filePath
			}
		}
	}
)

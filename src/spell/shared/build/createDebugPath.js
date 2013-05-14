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
		 * Returns the debugPath if debug mode is on and the debug path exists. Otherwise the releasePath is returned.
		 */
		return function( isDebug, debugPath, releasePath, basePath ) {
			var filePath

			if( isDebug ) {
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

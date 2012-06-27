define(
	'spell/shared/build/exportDeploymentArchive',
	[
		'child_process',
		'mkdirp',
		'path',

		'underscore.string'
	],
	function(
		child_process,
		mkdirp,
		path,

		_s
	) {
		'use strict'

		/**
		 * private
		 */


		/**
		 * public
		 */

		return function( projectPath, outputFilePath, next ) {
			var outputPath = path.dirname( outputFilePath),
				exportPath = path.resolve( projectPath, 'public' )

			console.log( 'exportPath:\t' + exportPath )
			console.log( 'outputPath:\t' + outputPath )
			console.log( 'outputFilePath:\t' + outputFilePath )


			if( !path.existsSync( outputPath ) ) {
				mkdirp.sync( outputPath )
			}

			// create zip archive
			var command = _s.sprintf( 'zip -r %1$s %2$s', outputFilePath, exportPath ),
				options = {
					env : {
						LC_ALL : 'en_US'
					}
				}

			child_process.exec( command, options, next )
		}
	}
)

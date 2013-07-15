define(
	'spell/shared/build/createProjectLibraryFilePaths',
	[
		'spell/functions',

		'flob',
		'path'
	],
	function(
		_,

		flob,
		path
	) {
		'use strict'


		return function( projectLibraryPath, ignoreOggFiles ) {
			var filePaths = _.filter(
				flob.sync( '**/*', { cwd : projectLibraryPath } ),
				function( filePath ) {
					var extension = path.extname( filePath )

					return extension !== '.js' && extension !== '.json' && (!ignoreOggFiles || extension !== '.ogg')
				}
			)

			return filePaths
		}
	}
)

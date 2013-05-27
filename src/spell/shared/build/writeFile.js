define(
	'spell/shared/build/writeFile',
	[
		'spell/shared/build/isFile',

		'fs'
	],
	function(
		isFile,

		fs
	) {
		'use strict'


		return function( filePath, data ) {
			// delete file if it already exists
			if( isFile( filePath ) ) {
				fs.unlinkSync( filePath )
			}

			fs.writeFileSync( filePath, data )
		}
	}
)

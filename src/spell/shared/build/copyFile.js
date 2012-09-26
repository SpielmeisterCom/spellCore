define(
	'spell/shared/build/copyFile',
	[
		'fs'
	],
	function(
		fs
	) {
		'use strict'


		return function( inputFilePath, outputFilePath ) {
			fs.writeFileSync(
				outputFilePath,
				fs.readFileSync( inputFilePath )
			)
		}
	}
)

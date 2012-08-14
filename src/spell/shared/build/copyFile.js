define(
	'spell/shared/build/copyFile',
	[
		'fs'
	],
	function(
		fs
	) {
		return function( inputFilePath, outputFilePath ) {
			fs.writeFileSync(
				outputFilePath,
				fs.readFileSync( inputFilePath )
			)
		}
	}
)

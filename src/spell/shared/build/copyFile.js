define(
	'spell/shared/build/copyFile',
	[
		'fs',
		'util'
	],
	function(
		fs,
		util
	) {
		return function( inputFilePath, outputFilePath ) {
			util.pump(
				fs.createReadStream( inputFilePath ),
				fs.createWriteStream( outputFilePath )
			)
		}
	}
)

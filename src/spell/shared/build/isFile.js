define(
	'spell/shared/build/isFile',
	[
		'fs',
		'path'
	],
	function(
		fs,
		path
	) {
		return function( filePath ) {
			if( path.existsSync( filePath ) ) {
				var stat = fs.lstatSync( filePath )

				if( stat.isFile() ) {
					return true
				}
			}

			return false
		}
	}
)

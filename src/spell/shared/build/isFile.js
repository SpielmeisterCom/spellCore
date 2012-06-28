define(
	'spell/shared/build/isFile',
	[
		'fs'
	],
	function(
		fs
	) {
		return function( filePath ) {
			if( fs.existsSync( filePath ) ) {
				var stat = fs.lstatSync( filePath )

				if( stat.isFile() ) {
					return true
				}
			}

			return false
		}
	}
)

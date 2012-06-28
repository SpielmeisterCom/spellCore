define(
	'spell/shared/build/isDirectory',
	[
		'fs'
	],
	function(
		fs
	) {
		return function( directoryPath ) {
			if( fs.existsSync( directoryPath ) ) {
				var stat = fs.lstatSync( directoryPath )

				if( stat.isDirectory() ) {
					return true
				}
			}

			return false
		}
	}
)

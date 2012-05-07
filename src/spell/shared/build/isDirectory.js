define(
	'spell/shared/build/isDirectory',
	[
		'fs',
		'path'
	],
	function(
		fs,
		path
	) {
		return function( directoryPath ) {
			if( path.existsSync( directoryPath ) ) {
				var stat = fs.lstatSync( directoryPath )

				if( stat.isDirectory() ) {
					return true
				}
			}

			return false
		}
	}
)

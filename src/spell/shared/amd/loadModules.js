define(
	'spell/shared/amd/loadModules',
	[
		'spell/shared/amd/extractModuleHeader',

		'fs',
		'glob',

		'spell/shared/util/platform/underscore'
	],
	function(
		extractModuleHeader,

		fs,
		glob,

		_
	) {
		'use strict'


		return function( sourcePath ) {
			var filePattern = sourcePath + '/**/*.js',
				filePaths = glob.sync( filePattern, {} )

			return _.reduce(
				filePaths,
				function( memo, filePath ) {
					var fileContent = fs.readFileSync( filePath ).toString( 'utf-8' ),
						moduleHeader = extractModuleHeader( fileContent )

					if( !moduleHeader ) return memo

					if( !moduleHeader.name ) {
						console.error( 'Error: Anonymous module in file \'' + filePath + '\' is not supported.' )
						return memo
					}

					memo[ moduleHeader.name ] = {
						dependencies : moduleHeader.dependencies,
						source : fileContent
					}

					return memo
				},
				{}
			)
		}
	}
)

define(
	'spell/client/loading/createFilesToLoad',
	[
		'spell/shared/util/createLibraryFilePath',

		'spell/functions'
	],
	function(
		createLibraryFilePath,

		_
	) {
		'use strict'


		return function( configurationManager, assets ) {
			var currentLanguage = configurationManager.getValue( 'currentLanguage' )

			return _.unique(
				_.reduce(
					assets,
					function( memo, asset ) {
						if( !asset.file ) return memo

						var libraryFilePath

						if( asset.config && asset.config.localized ) {
							var fileName          = asset.file,
								fileExtension     = fileName.substr( fileName.lastIndexOf( '.' ) + 1 ),
								localizedFileName = asset.name + '.' + currentLanguage + '.' + fileExtension

							libraryFilePath = {
								libraryPath : createLibraryFilePath( asset.namespace, asset.file ),
								libraryPathUrlUsedForLoading : createLibraryFilePath( asset.namespace, localizedFileName )
							}

						} else {
							libraryFilePath = createLibraryFilePath( asset.namespace, asset.file )
						}

						return memo.concat( libraryFilePath )
					},
					[]
				)
			)
		}
	}
)

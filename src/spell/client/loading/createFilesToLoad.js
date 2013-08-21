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
						var config = asset.config

						if( !config ) {
							return memo
						}

						var subtype = asset.subtype,
							isSound = subtype === 'sound'

						if( !isSound &&
							subtype !== 'appearance' &&
							subtype !== 'font' &&
							subtype !== 'spriteSheet' ) {

							return memo
						}

						var isLocalizable   = config.localized !== undefined,
							libraryFilePath

						if( isLocalizable ) {
							if( config.localized ) {
								var languageToExtension = config.localization,
									fileExtension       = isSound ? 'mp3' : languageToExtension[ currentLanguage ],
									localizedFileName   = asset.name + '.' + currentLanguage + '.' + fileExtension

								libraryFilePath = {
									libraryPath : createLibraryFilePath( asset.namespace, asset.name + '.' + fileExtension ),
									libraryPathUrlUsedForLoading : createLibraryFilePath( asset.namespace, localizedFileName )
								}

							} else {
								if( subtype === 'sound' ) {
									libraryFilePath = createLibraryFilePath( asset.namespace, asset.name + '.mp3' )

								} else {
									libraryFilePath = createLibraryFilePath( asset.namespace, asset.name + '.' + config.extension )
								}
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

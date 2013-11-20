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
			var currentLanguage     = configurationManager.getValue( 'currentLanguage' ),
				currentQualityLevel = configurationManager.getValue( 'currentQualityLevel' )

			return _.reduce(
				assets,
				function( memo, asset, libraryId ) {
					var config          = asset.config,
						subtype         = asset.subtype,
						isSound         = subtype === 'sound',
						isAppearance    = subtype === 'appearance',
						isFont          = subtype === 'font',
						isSpriteSheet   = subtype === 'spriteSheet',
						libraryFilePath

					if( config &&
						( isSound || isAppearance || isFont || isSpriteSheet ) ) {

						if( isFont || isSpriteSheet ) {
							libraryFilePath = createLibraryFilePath( asset.namespace, asset.file )

						} else {
							var isLocalized        = config.localized,
								qualityLevelSuffix = config.qualityLevels ? '.' + currentQualityLevel : ''

							if( isLocalized ) {
								var languageToExtension = config.localization,
									fileExtension       = isSound ? 'mp3' : languageToExtension[ currentLanguage ],
									localizedFileName   = asset.name + '.' + currentLanguage + qualityLevelSuffix + '.' + fileExtension

								libraryFilePath = createLibraryFilePath( asset.namespace, localizedFileName )

							} else {
								libraryFilePath = createLibraryFilePath(
									asset.namespace,
									asset.name + qualityLevelSuffix + ( isSound ? '.mp3' : '.' + config.extension )
								)
							}
						}

						memo[ libraryId ] = libraryFilePath
					}

					return memo
				},
				{}
			)
		}
	}
)

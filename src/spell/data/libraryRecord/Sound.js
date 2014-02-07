define(
	'spell/data/libraryRecord/Sound',
	[
		'spell/shared/util/createLibraryFilePath'
	],
	function(
		createLibraryFilePath
	) {
		'use strict'


		var Sound = function( metaData ) {
		}

		Sound.getDependencies = function( spell, metaData ) {}

		Sound.hasExternalResource = function( spell, metaData ) {
			return true
		}

		Sound.getExternalResourceFilePaths = function( spell, metaData ) {
			var configurationManager = spell.configurationManager,
				currentLanguage      = configurationManager.getValue( 'currentLanguage' ),
				currentQualityLevel  = configurationManager.getValue( 'currentQualityLevel' )

			var config             = metaData.config,
				isLocalized        = config.localized,
				qualityLevelSuffix = config.qualityLevels ? '.' + currentQualityLevel : '',
				libraryFilePath

			if( isLocalized ) {
				libraryFilePath = createLibraryFilePath(
					metaData.id.getNamespace(),
					metaData.id.getName() + '.' + currentLanguage + qualityLevelSuffix + '.mp3'
				)

			} else {
				libraryFilePath = createLibraryFilePath(
					metaData.id.getNamespace(),
					metaData.id.getName() + qualityLevelSuffix + '.mp3'
				)
			}

			return [ libraryFilePath ]
		}

		return Sound
	}
)

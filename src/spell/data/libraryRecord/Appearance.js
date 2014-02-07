define(
	'spell/data/libraryRecord/Appearance',
	[
		'spell/shared/util/createLibraryFilePath'
	],
	function(
		createLibraryFilePath
	) {
		'use strict'


		var Appearance = function( metaData ) {
		}

		Appearance.getDependencies = function( spell, metaData ) {}

		Appearance.hasExternalResource = function( spell, metaData ) {
			return true
		}

		Appearance.getExternalResourceFilePaths = function( spell, metaData ) {
			var configurationManager = spell.configurationManager,
				currentLanguage      = configurationManager.getValue( 'currentLanguage' ),
				currentQualityLevel  = configurationManager.getValue( 'currentQualityLevel' )

			var config             = metaData.config,
				isLocalized        = config.localized,
				qualityLevelSuffix = config.qualityLevels ? '.' + currentQualityLevel : '',
				libraryFilePath

			if( isLocalized ) {
				var fileExtension = config.localization[ currentLanguage ]

				libraryFilePath = createLibraryFilePath(
					metaData.id.getNamespace(),
					metaData.id.getName() + '.' + currentLanguage + qualityLevelSuffix + '.' + fileExtension
				)

			} else {
				libraryFilePath = createLibraryFilePath(
					metaData.id.getNamespace(),
					metaData.id.getName() + qualityLevelSuffix + '.' + config.extension
				)
			}

			return [ libraryFilePath ]
		}

		return Appearance
	}
)

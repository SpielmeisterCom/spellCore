define(
	'spell/data/libraryRecord/SpriteSheet',
	[
		'spell/shared/util/createLibraryFilePath'
	],
	function(
		createLibraryFilePath
	) {
		'use strict'


		var SpriteSheet = function( metaData ) {
		}

		SpriteSheet.getDependencies = function( spell, metaData ) {}

		SpriteSheet.hasExternalResource = function( spell, metaData ) {
			return true
		}

		SpriteSheet.getExternalResourceFilePaths = function( spell, metaData ) {
			return [ createLibraryFilePath( metaData.id.getNamespace(), metaData.file ) ]
		}

		return SpriteSheet
	}
)

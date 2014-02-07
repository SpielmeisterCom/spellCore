define(
	'spell/data/libraryRecord/Font',
	[
		'spell/shared/util/createLibraryFilePath'
	],
	function(
		createLibraryFilePath
	) {
		'use strict'


		var Font = function( metaData ) {
		}

		Font.getDependencies = function( spell, metaData ) {}

		Font.hasExternalResource = function( spell, metaData ) {
			return true
		}

		Font.getExternalResourceFilePaths = function( spell, metaData ) {
			return [ createLibraryFilePath( metaData.id.getNamespace(), metaData.file ) ]
		}

		return Font
	}
)

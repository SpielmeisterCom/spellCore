define(
	'spell/data/libraryRecord/Translation',
	function() {
		'use strict'


		var Translation = function( metaData ) {
		}

		Translation.getDependencies = function( spell, metaData ) {}

		Translation.hasExternalResource = function( spell, metaData ) {
			return false
		}

		Translation.getExternalResourceFilePaths = function( spell, metaData ) {
			return []
		}

		return Translation
	}
)

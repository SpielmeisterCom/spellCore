define(
	'spell/data/libraryRecord/Script',
	function() {
		'use strict'


		var Script = function( metaData ) {
		}

		Script.getDependencies = function( spell, metaData ) {}

		Script.hasExternalResource = function( spell, metaData ) {
			return true
		}

		Script.getExternalResourceFilePaths = function( spell, metaData ) {
			return []
		}

		return Script
	}
)

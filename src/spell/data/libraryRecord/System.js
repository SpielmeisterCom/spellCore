define(
	'spell/data/libraryRecord/System',
	function() {
		'use strict'


		var System = function( metaData ) {
		}

		System.getDependencies = function( spell, metaData ) {
			return metaData.dependencies
		}

		System.hasExternalResource = function( spell, metaData ) {
			return false
		}

		System.getExternalResourceFilePaths = function( spell, metaData ) {
			return []
		}

		return System
	}
)

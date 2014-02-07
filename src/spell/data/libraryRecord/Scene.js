define(
	'spell/data/libraryRecord/Scene',
	function() {
		'use strict'


		var Scene = function( metaData ) {
		}

		Scene.getDependencies = function( spell, metaData ) {
			return metaData.libraryIds
		}

		Scene.hasExternalResource = function( spell, metaData ) {
			return false
		}

		Scene.getExternalResourceFilePaths = function( spell, metaData ) {
			return []
		}

		return Scene
	}
)

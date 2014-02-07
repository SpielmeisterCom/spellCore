define(
	'spell/data/libraryRecord/Animation',
	function() {
		'use strict'


		var Animation = function( metaData ) {
		}

		Animation.getDependencies = function( spell, metaData ) {
			return [ metaData.assetId.split( ':' )[ 1 ] ]
		}

		Animation.hasExternalResource = function( spell, metaData ) {
			return false
		}

		Animation.getExternalResourceFilePaths = function( spell, metaData ) {
			return []
		}

		return Animation
	}
)

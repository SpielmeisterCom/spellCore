define(
	'spell/data/libraryRecord/KeyFrameAnimation',
	function() {
		'use strict'


		var KeyFrameAnimation = function( metaData ) {
		}

		KeyFrameAnimation.getDependencies = function( spell, metaData ) {
			return [ metaData.assetId.split( ':' )[ 1 ] ]
		}

		KeyFrameAnimation.hasExternalResource = function( spell, metaData ) {
			return false
		}

		KeyFrameAnimation.getExternalResourceFilePaths = function( spell, metaData ) {
			return []
		}

		return KeyFrameAnimation
	}
)

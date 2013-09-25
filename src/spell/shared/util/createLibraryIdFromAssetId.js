define(
	'spell/shared/util/createLibraryIdFromAssetId',
	function() {
		'use strict'


		return function( assetId ) {
			return assetId ?
				assetId.slice( assetId.indexOf( ':' ) + 1 ) :
				undefined
		}
	}
)

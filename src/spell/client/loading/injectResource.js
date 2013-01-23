define(
	'spell/client/loading/injectResource',
	function() {
		'use strict'


		return function( libraryManager, asset ) {
			if( !asset.resourceId ) return

			var resource = libraryManager.get( asset.resourceId )
			if( !resource ) return

			asset.resource = resource
		}
	}
)

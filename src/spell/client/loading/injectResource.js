define(
	'spell/client/loading/injectResource',
	function() {
		'use strict'


		return function( resourceLoader, asset ) {
			if( !asset.resourceId ) return

			var resource = resourceLoader.get( asset.resourceId )
			if( !resource ) return

			asset.resource = resource
		}
	}
)

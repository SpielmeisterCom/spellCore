define(
	'spell/client/loading/injectResource',
	function() {
		'use strict'


		return function( resources, asset ) {
			if( !asset.resourceId ) return

			var resource = resources[ asset.resourceId ]

			if( !resource ) throw 'Error: Could not resolve resource id \'' + asset.resourceId + '\'.'

			asset.resource = resource
		}
	}
)

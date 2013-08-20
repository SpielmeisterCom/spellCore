define(
	'spell/client/loading/addNamespaceAndName',
	function() {
		'use strict'


		/**
		 * Adds the namespace and name attribute to library records.
		 *
		 * @param records
		 */
		var addNamespaceAndName = function( records ) {
			for( var key in records ) {
				var value = records[ key ]

				var splitOffset = key.lastIndexOf( '.' )

				value.name      = key.substr( splitOffset + 1, key.length )
				value.namespace = key.substr( 0, splitOffset )
			}
		}

		return addNamespaceAndName
	}
)

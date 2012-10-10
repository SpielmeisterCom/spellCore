define(
	'spell/client/loading/addNamespaceAndName',
	[
		'spell/shared/util/createIdFromLibraryFilePath',

		'spell/functions'
	],
	function(
		createIdFromLibraryFilePath,

		_
	) {
		'use strict'


		/**
		 * Adds the namespace and name attribute to library records.
		 *
		 * @param records
		 */
		var addNamespaceAndName = function( records ) {
			_.each(
				records,
				function( value, key ) {
					var idParts = createIdFromLibraryFilePath( key, true )

					value.name      = idParts.pop()
					value.namespace = idParts.join( '.' )
				}
			)
		}

		return addNamespaceAndName
	}
)

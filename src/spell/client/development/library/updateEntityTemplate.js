define(
	'spell/client/development/library/updateEntityTemplate',
	[
		'spell/shared/util/createId',
		'spell/shared/util/createLibraryFilePathFromId'
	],
	function(
		createId,
		createLibraryFilePathFromId
	) {
		'use strict'


		return function( spell, payload ) {
			var cacheContent    = {},
				definition      = payload.definition,
				libraryFilePath = createLibraryFilePathFromId( createId( definition.namespace, definition.name ) )

			cacheContent[ libraryFilePath ] = definition

			spell.libraryManager.addToCache( cacheContent )
			spell.entityManager.updateEntityTemplate( definition )
		}
	}
)

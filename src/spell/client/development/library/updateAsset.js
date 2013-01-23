define(
	'spell/client/development/library/updateAsset',
	[
		'spell/client/loading/addNamespaceAndName',
		'spell/client/loading/createFilesToLoad',
		'spell/client/loading/injectResource',
		'spell/client/util/updateAssets',
		'spell/shared/util/createAssetId',
		'spell/shared/util/createId',
		'spell/shared/util/createLibraryFilePath',
		'spell/shared/util/createLibraryFilePathFromId',
		'spell/Events',

		'spell/functions'
	],
	function(
		addNamespaceAndName,
		createFilesToLoad,
		injectResource,
		updateAssets,
		createAssetId,
		createId,
		createLibraryFilePath,
		createLibraryFilePathFromId,
		Events,

		_
	) {
		'use strict'


		var updateResourcesAndAssets = function( spell, assetId, asset ) {
			injectResource( spell.libraryManager, asset )
			spell.entityManager.updateAssetReferences( assetId, asset )
		}

		return function( spell, payload ) {
			var assetManager    = spell.assetManager,
				definition      = payload.definition,
				id              = createId( definition.namespace, definition.name ),
				assetId         = createAssetId( definition.subtype, id ),
				libraryFilePath = createLibraryFilePathFromId( id )

			var loadedAssets = {}

			loadedAssets[ libraryFilePath ] = definition
			addNamespaceAndName( loadedAssets )

			updateAssets( assetManager, loadedAssets )

			var asset = assetManager.get( assetId )

			if( asset.resourceId ) {
				var filesToLoad = createFilesToLoad( loadedAssets )

				if( filesToLoad.length > 0 ) {
					// when an asset references an external resource trigger loading it
					spell.libraryManager.load(
						filesToLoad,
						asset.resourceId,
						{
							omitCache          : true,
							onLoadingCompleted : _.bind( updateResourcesAndAssets, null, spell, assetId, asset )
						}
					)
				}
			}

			updateResourcesAndAssets( spell, assetId, asset )

			spell.eventManager.publish(
				[ Events.ASSET_UPDATED, definition.subtype ],
				[ assetId ]
			)
		}
	}
)

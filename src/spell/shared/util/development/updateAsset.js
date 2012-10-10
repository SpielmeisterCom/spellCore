define(
	'spell/shared/util/development/updateAsset',
	[
		'spell/client/loading/addNamespaceAndName',
		'spell/client/loading/createFilesToLoad',
		'spell/client/loading/injectResource',
		'spell/client/util/createAssets',
		'spell/shared/util/createAssetId',
		'spell/shared/util/createId',
		'spell/shared/util/createLibraryFilePath',
		'spell/shared/util/createLibraryFilePathFromId',

		'spell/functions'
	],
	function(
		addNamespaceAndName,
		createFilesToLoad,
		injectResource,
		createAssets,
		createAssetId,
		createId,
		createLibraryFilePath,
		createLibraryFilePathFromId,

		_
	) {
		'use strict'


		var updateResourcesAndAssets = function( spell, assetId, asset ) {
			spell.logger.log( 'updating resources and assets' )

			injectResource( spell.resources, asset )
			spell.EntityManager.updateAssetReferences( assetId, asset )
		}

		return function( spell, payload ) {
			var definition      = payload.definition,
				id              = createId( definition.namespace, definition.name ),
				assetId         = createAssetId( definition.subtype, id ),
				libraryFilePath = createLibraryFilePathFromId( id )

			var loadedAssets = {}

			loadedAssets[ libraryFilePath ] = definition
			addNamespaceAndName( loadedAssets )

			_.extend( spell.assets, createAssets( loadedAssets ) )

			var asset = spell.assets[ assetId ]

			if( asset.resourceId ) {
				// when an asset references an external resource trigger loading it
				var resourceBundleId = libraryFilePath

				spell.resourceLoader.start(
					createFilesToLoad( loadedAssets ),
					{
						omitCache          : true,
						onLoadingCompleted : _.bind( updateResourcesAndAssets, null, spell, assetId, asset )
					}
				)

			} else {
				updateResourcesAndAssets( spell, assetId, asset )
			}
		}
	}
)

define(
	'spell/client/development/library/updateAsset',
	[
		'spell/client/development/library/loadAsset',
		'spell/client/loading/addNamespaceAndName',
		'spell/client/loading/createFilesToLoad',
		'spell/client/loading/injectResource',
		'spell/client/util/updateAssets',
		'spell/shared/util/createAssetId',
		'spell/shared/util/createId',
		'spell/shared/util/createLibraryFilePath',
		'spell/shared/util/createLibraryFilePathFromId',
		'spell/shared/util/createLibraryIdFromAssetId',

		'spell/functions'
	],
	function(
		loadAsset,
		addNamespaceAndName,
		createFilesToLoad,
		injectResource,
		updateAssets,
		createAssetId,
		createId,
		createLibraryFilePath,
		createLibraryFilePathFromId,
		createLibraryIdFromAssetId,

		_
	) {
		'use strict'


		return function( spell, payload ) {
			var assetManager         = spell.assetManager,
				eventManager         = spell.eventManager,
				configurationManager = spell.configurationManager,
				definition           = payload.definition,
				id                   = createId( definition.namespace, definition.name ),
				typedId              = createAssetId( definition.subtype, id )

			var loadedAssets = [ definition ]

			// The current state of asset update handling needs to be improved. In order to do that dependencies between assets must be accessible in a
			// normalized fashion.

			if( !definition.file &&
				!definition.assetId ) {

				updateAssets( assetManager, loadedAssets, true )

				eventManager.publish(
					[ eventManager.EVENT.ASSET_UPDATED, definition.subtype ],
					[ typedId ]
				)
			}

			if( definition.file ) {
				spell.libraryManager.load(
					createFilesToLoad( configurationManager, loadedAssets ),
					{
						assetManager       : spell.assetManager,
						isMetaDataLoad     : false,
						omitCache          : true,
						onLoadingCompleted : function( loadedFiles ) {
							updateAssets( assetManager, loadedAssets, true )

							spell.libraryManager.addToCache( loadedAssets )

							var libraryIds = assetManager.getLibraryIdByResourceId( createLibraryFilePath( definition.namespace, definition.file ) )

							var assetsToUpdate = _.reduce(
								libraryIds,
								function( memo, libraryId ) {
									var libraryPathJson = createLibraryFilePathFromId( libraryId )

									memo[ libraryPathJson ] = spell.libraryManager.get( libraryPathJson )

									return memo
								},
								{}
							)

							updateAssets( assetManager, assetsToUpdate, true )

							assetManager.injectResources( loadedFiles )

							spell.entityManager.refreshAssetReferences( assetManager )

							eventManager.publish(
								[ eventManager.EVENT.ASSET_UPDATED, definition.subtype ],
								[ typedId ]
							)
						}
					}
				)
			}

			var assetId = definition.assetId

			if( assetId ) {
				// load referenced asset first
				loadAsset(
					spell,
					createLibraryIdFromAssetId( assetId ),
					function( loadedFiles ) {
						// now update referencing asset (-> updated definition) and inject referenced asset
						updateAssets( assetManager, loadedAssets, true )

						assetManager.injectResources( loadedFiles )

						spell.entityManager.updateAssetReferences( typedId, assetManager.get( typedId ) )

						eventManager.publish(
							[ eventManager.EVENT.ASSET_UPDATED, definition.subtype ],
							[ typedId ]
						)
					}
				)
			}
		}
	}
)

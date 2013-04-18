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


		return function( spell, payload ) {
			var assetManager         = spell.assetManager,
				configurationManager = spell.configurationManager,
				definition           = payload.definition,
				id                   = createId( definition.namespace, definition.name ),
				typedId              = createAssetId( definition.subtype, id ),
				libraryFilePath      = createLibraryFilePathFromId( id )

			var loadedAssets = {}

			loadedAssets[ libraryFilePath ] = definition
			addNamespaceAndName( loadedAssets )


			// The current state of asset update handling needs to be improved. In order to do that dependencies between assets must be accessible in a
			// normalized fashion.

			if( !definition.file &&
				!definition.assetId ) {

				updateAssets( assetManager, loadedAssets, true )

				spell.eventManager.publish(
					[ Events.ASSET_UPDATED, definition.subtype ],
					[ typedId ]
				)
			}

			if( definition.file ) {
				spell.libraryManager.load(
					createFilesToLoad( configurationManager, loadedAssets ),
					{
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

							spell.eventManager.publish(
								[ Events.ASSET_UPDATED, definition.subtype ],
								[ typedId ]
							)
						}
					}
				)
			}

			if( definition.assetId ) {
				var assetId = definition.assetId

				// load meta data record
				spell.libraryManager.load(
					[ createLibraryFilePathFromId( assetId.slice( assetId.indexOf( ':' ) + 1 ) ) ],
					{
						omitCache          : true,
						onLoadingCompleted : function( loadedLibraryRecords ) {
							updateAssets( assetManager, loadedLibraryRecords )

							// load file
							spell.libraryManager.load(
								createFilesToLoad( configurationManager, loadedLibraryRecords ),
								{
									isMetaDataLoad     : false,
									omitCache          : true,
									onLoadingCompleted : function( loadedFiles ) {
										updateAssets( assetManager, loadedAssets, true )

										assetManager.injectResources( loadedFiles )

										spell.entityManager.updateAssetReferences( typedId, assetManager.get( typedId ) )

										spell.eventManager.publish(
											[ Events.ASSET_UPDATED, definition.subtype ],
											[ typedId ]
										)
									}
								}
							)
						}
					}
				)
			}
		}
	}
)

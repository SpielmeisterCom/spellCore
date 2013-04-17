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
		'spell/Events'
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
		Events
	) {
		'use strict'


		var updateResourcesAndAssets = function( spell, assetId, asset ) {
			injectResource( spell.libraryManager, asset )
			spell.entityManager.updateAssetReferences( assetId, asset )
		}

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


			if( !definition.file &&
				!definition.assetId ) {

				updateAssets( assetManager, loadedAssets )

				spell.eventManager.publish(
					[ Events.ASSET_UPDATED, definition.subtype ],
					[ typedId ]
				)
			}

			if( definition.file ) {
				var asset = assetManager.get( typedId )

				spell.libraryManager.load(
					createFilesToLoad( configurationManager, loadedAssets ),
					{
						isMetaDataLoad     : false,
						omitCache          : true,
						onLoadingCompleted : function() {
							updateResourcesAndAssets( spell, typedId, asset )

							spell.eventManager.publish(
								[ Events.ASSET_UPDATED, definition.subtype ],
								[ assetId ]
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
										updateAssets( assetManager, loadedAssets )

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

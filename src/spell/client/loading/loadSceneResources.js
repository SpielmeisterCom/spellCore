define(
	'spell/client/loading/loadSceneResources',
	[
		'spell/client/util/updateAssets',
		'spell/client/loading/addNamespaceAndName',
		'spell/client/loading/createFilesToLoad',
		'spell/client/loading/injectResource',
		'spell/shared/util/createLibraryFilePathsFromIds',
		'spell/math/util',
		'spell/shared/util/createId',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		updateAssets,
		addNamespaceAndName,
		createFilesToLoad,
		injectResource,
		createLibraryFilePathsFromIds,
		mathUtil,
		createId,
		PlatformKit,

		_
	) {
		'use strict'


		var groupByType = function( libraryRecords ) {
			return _.reduce(
				libraryRecords,
				function( memo, value ) {
					var type = value.type

					if( memo[ type ] ) {
						memo[ type ].push( value )

					} else {
						memo[ type ] = [ value ]
					}

					return memo
				},
				{}
			)
		}

		var addIdAsKey = function( result, libraryRecords ) {
			for( var id in libraryRecords ) {
				var libraryRecord = libraryRecords[ id ]

				result[ createId( libraryRecord.namespace, libraryRecord.name ) ] = libraryRecord
			}
		}

		var createLoadingProgress = function( eventManager, progressCallback ) {
			if( !progressCallback ) progressCallback = function() {}

			var LoadingProgress = function( eventManager, progressCallback ) {
				this.bundles          = {}
				this.eventManager     = eventManager
				this.progressCallback = progressCallback
				this.progress         = 0
				this.lastSendProgress = 0
				this.progressHandler  = function( portion, progress, numCompleted, numTotal ) {
					this.progress += portion / numTotal

					var currentProgress = mathUtil.roundToResolution( this.progress, 0.01 )

					if( currentProgress <= this.lastSendProgress ) return

					this.lastSendProgress = currentProgress
					this.progressCallback( currentProgress )
				}
			}

			LoadingProgress.prototype = {
				addBundle : function( name, portion ) {
					var eventManager = this.eventManager

					// the loading interval is [ 0, 0.99 ], call "complete" to signal progress of 1
					var handler = _.bind( this.progressHandler, this, portion * 0.99 )

					this.bundles[ name ] = handler

					eventManager.subscribe( [ eventManager.EVENT.RESOURCE_PROGRESS, name ], handler )
				},
				complete : function() {
					this.progressCallback( 1 )
				},
				destroy : function() {
					var bundles      = this.bundles,
						eventManager = this.eventManager

					for( var name in bundles ) {
						var handler = bundles[ name ]

						eventManager.unsubscribe( [ eventManager.EVENT.RESOURCE_PROGRESS, name ], handler )
					}
				}
			}

			return new LoadingProgress( eventManager, progressCallback )
		}


		return function( spell, sceneId, next, progressCallback ) {
			var assetManager         = spell.assetManager,
				configurationManager = spell.configurationManager,
				eventManager         = spell.eventManager,
				EVENT                = eventManager.EVENT,
				libraryManager       = spell.libraryManager,
				resources            = spell.resources,
				entityManager        = spell.entityManager

			var libraryBundleName  = sceneId + '-library',
				resourceBundleName = sceneId + '-resources'

			var loadingProgress = createLoadingProgress( eventManager, progressCallback )

			loadingProgress.addBundle( sceneId, 0.1 )
			loadingProgress.addBundle( libraryBundleName, 0.1 )
			loadingProgress.addBundle( resourceBundleName, 0.8 )


			eventManager.waitFor(
				[ EVENT.RESOURCE_LOADING_COMPLETED, sceneId ],
				function( loadedRecords ) {
					addIdAsKey( spell.scenes, loadedRecords )
				}

			).resume( function() {
				eventManager.waitFor(
					[ EVENT.RESOURCE_LOADING_COMPLETED, libraryBundleName ],
					function( loadedRecords ) {
						var library = groupByType( loadedRecords )

						updateAssets( assetManager, library.asset )

						libraryManager.load(
							createFilesToLoad( configurationManager, library.asset ),
							{
								name : resourceBundleName,
								isMetaDataLoad : false
							}
						)

						_.each(
							library.component,
							_.bind( entityManager.registerComponent, entityManager )
						)

						addIdAsKey( spell.scenes, library.scene )
					}

				).and(
					[ EVENT.RESOURCE_LOADING_COMPLETED, resourceBundleName ],
					_.bind( assetManager.injectResources, assetManager )

				).resume( function() {
					loadingProgress.complete()
					loadingProgress.destroy()

					eventManager.unsubscribeAll( [ EVENT.RESOURCE_LOADING_COMPLETED, sceneId ] )
					eventManager.unsubscribeAll( [ EVENT.RESOURCE_LOADING_COMPLETED, libraryBundleName ] )
					eventManager.unsubscribeAll( [ EVENT.RESOURCE_LOADING_COMPLETED, resourceBundleName ] )

					next()
				} )

				// start loading the required library records
				var scene = spell.scenes[ sceneId ]

				libraryManager.load(
					createLibraryFilePathsFromIds( scene.libraryIds ),
					{
						name : libraryBundleName
					}
				)
			} )

			// load scene library record
			libraryManager.load(
				createLibraryFilePathsFromIds( [ sceneId ] ),
				{
					name : sceneId
				}
			)
		}
	}
)

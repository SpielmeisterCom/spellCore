define(
	'spell/client/loading/loadSceneResources',
	[
		'spell/client/util/updateAssets',
		'spell/client/loading/addNamespaceAndName',
		'spell/client/loading/createFilesToLoad',
		'spell/client/loading/injectResource',
		'spell/math/util',
		'spell/shared/util/createId',
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		updateAssets,
		addNamespaceAndName,
		createFilesToLoad,
		injectResource,
		mathUtil,
		createId,
		Events,
		PlatformKit,

		_
	) {
		'use strict'


		var libraryIdsToJsonFilenames = function( resourceIds ) {
			return _.map(
				resourceIds,
				function( resourceId ) {
					return resourceId.replace( /\./g, '/' ) + '.json'
				}
			)
		}

		var addTemplates = function( templateManager, templates ) {
			_.each(
				templates,
				function( template ) {
					templateManager.add( template )
				}
			)
		}

		var groupByType = function( libraryRecords ) {
			return _.reduce(
				libraryRecords,
				function( memo, value, key ) {
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

		var addIdAsKey = function( libraryRecords ) {
			return _.reduce(
				libraryRecords,
				function( memo, libraryRecord ) {
					memo[ createId( libraryRecord.namespace, libraryRecord.name ) ] = libraryRecord

					return memo
				},
				{}
			)
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

					var currentProgress = mathUtil.roundToResolution( this.progress, 0.05 )

					if( currentProgress <= this.lastSendProgress ) return

					this.lastSendProgress = currentProgress
					this.progressCallback( currentProgress )
				}
			}

			LoadingProgress.prototype = {
				addBundle : function( name, portion ) {
					// the loading interval is [ 0, 0.99 ], call "complete" to signal progress of 1
					var handler = _.bind( this.progressHandler, this, portion * 0.99 )

					this.bundles[ name ] = handler

					this.eventManager.subscribe( [ Events.RESOURCE_PROGRESS, name ], handler )
				},
				complete : function() {
					this.progressCallback( 1 )
				},
				destroy : function() {
					var eventManager = this.eventManager

					_.each(
						this.bundles,
						function( handler, name ) {
							eventManager.unsubscribe( [ Events.RESOURCE_PROGRESS, name ], handler )
						}
					)
				}
			}

			return new LoadingProgress( eventManager, progressCallback )
		}


		return function( spell, sceneId, next, progressCallback ) {
			var eventManager     = spell.eventManager,
				renderingContext = spell.renderingContext,
				resourceLoader   = spell.resourceLoader,
				resources        = spell.resources,
				runtimeModule    = spell.runtimeModule,
				templateManager  = spell.templateManager

			var libraryBundleName  = 'library',
				resourceBundleName = 'resources'

			var loadingProgress = createLoadingProgress( eventManager, progressCallback )

			loadingProgress.addBundle( sceneId, 0.1 )
			loadingProgress.addBundle( libraryBundleName, 0.45 )
			loadingProgress.addBundle( resourceBundleName, 0.45 )


			eventManager.waitFor(
				[ Events.RESOURCE_LOADING_COMPLETED, sceneId ],
				function( loadedRecords ) {
					addNamespaceAndName( loadedRecords )

					_.extend( spell.scenes, addIdAsKey( loadedRecords ) )
				}

			).resume( function() {
				eventManager.waitFor(
					[ Events.RESOURCE_LOADING_COMPLETED, libraryBundleName ],
					function( loadedRecords ) {
						addNamespaceAndName( loadedRecords )

						var library = groupByType( loadedRecords )

						updateAssets( spell.assets, library.asset )

						resourceLoader.load(
							createFilesToLoad( library.asset ),
							resourceBundleName
						)

						addTemplates( templateManager, library.component )
						addTemplates( templateManager, library.entityTemplate )
						addTemplates( templateManager, library.system )
					}

				).and(
					[ Events.RESOURCE_LOADING_COMPLETED, resourceBundleName ],
					function( loadedResources ) {
						_.each(
							spell.assets,
							_.bind( injectResource, null, loadedResources )
						)
					}

				).resume( function() {
					loadingProgress.complete()
					loadingProgress.destroy()
					next()
				} )

				// start loading the required library records
				var scene = spell.scenes[ sceneId ]

				resourceLoader.load(
					libraryIdsToJsonFilenames( scene.libraryIds ),
					libraryBundleName
				)
			} )

			// load scene library record
			resourceLoader.load(
				libraryIdsToJsonFilenames( [ sceneId ] ),
				sceneId
			)
		}
	}
)

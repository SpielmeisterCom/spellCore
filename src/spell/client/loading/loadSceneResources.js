define(
	'spell/client/loading/loadSceneResources',
	[
		'spell/client/util/updateAssets',
		'spell/client/loading/addNamespaceAndName',
		'spell/client/loading/createFilesToLoad',
		'spell/client/loading/injectResource',
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
		createId,
		Events,
		PlatformKit,
		_
	) {
		'use strict'


		var createSendLoadingProgress = function( progressCallback ) {
			if( !progressCallback ) return function() {}

			var numLoadingSteps    = 3,
				invNumLoadingSteps = 1 / numLoadingSteps,
				loadingStep        = 0

			return function() {
				progressCallback( loadingStep++ * invNumLoadingSteps )
			}
		}

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


		return function( spell, sceneId, next, progressCallback ) {
			var eventManager     = spell.eventManager,
				renderingContext = spell.renderingContext,
				resourceLoader   = spell.resourceLoader,
				resources        = spell.resources,
				runtimeModule    = spell.runtimeModule,
				templateManager  = spell.templateManager

			var libraryBundleName  = 'library',
				resourceBundleName = 'resources'

			var sendLoadingProgress = createSendLoadingProgress( progressCallback )


			eventManager.waitFor(
				[ Events.RESOURCE_LOADING_COMPLETED, sceneId ],
				function( loadedRecords ) {
					addNamespaceAndName( loadedRecords )

					_.extend( spell.scenes, addIdAsKey( loadedRecords ) )

					sendLoadingProgress()
				}

			).resume( function() {
				eventManager.waitFor(
					[ Events.RESOURCE_LOADING_COMPLETED, libraryBundleName ],
					function( loadedRecords ) {
						addNamespaceAndName( loadedRecords )

						var library = groupByType( loadedRecords )

						updateAssets( spell.assets, library.asset )
						resourceLoader.load( createFilesToLoad( library.asset ), resourceBundleName )

						addTemplates( templateManager, library.component )
						addTemplates( templateManager, library.entityTemplate )
						addTemplates( templateManager, library.system )

						sendLoadingProgress()
					}

				).and(
					[ Events.RESOURCE_LOADING_COMPLETED, resourceBundleName ],
					function( loadedResources ) {
						_.each(
							spell.assets,
							_.bind( injectResource, null, loadedResources )
						)

						sendLoadingProgress()
					}

				).resume( function() {
					sendLoadingProgress()

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

			sendLoadingProgress()
		}
	}
)

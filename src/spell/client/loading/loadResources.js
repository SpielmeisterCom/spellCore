define(
	'spell/client/loading/loadResources',
	[
		'spell/client/util/createAssets',
		'spell/client/loading/addNamespaceAndName',
		'spell/client/loading/createFilesToLoad',
		'spell/client/loading/injectResource',
		'spell/shared/util/createId',
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',
		'spell/functions'
	],
	function(
		createAssets,
		addNamespaceAndName,
		createFilesToLoad,
		injectResource,
		createId,
		Events,
		PlatformKit,
		_
	) {
		'use strict'


		var createSendLoadingProgress = function( sendMessageToEditor ) {
			if( !sendMessageToEditor ) return function() {}

			var numLoadingSteps    = 2,
				invNumLoadingSteps = 1 / numLoadingSteps,
				loadingStep        = 0

			return function() {
				sendMessageToEditor( 'spell.loadingProgress', ( loadingStep++ * invNumLoadingSteps) )
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


		return function( spell, sendMessageToEditor, next ) {
			var eventManager     = spell.eventManager,
				renderingContext = spell.renderingContext,
				resourceLoader   = spell.resourceLoader,
				resources        = spell.resources,
				runtimeModule    = spell.runtimeModule,
				templateManager  = spell.templateManager

			var libraryBundleName  = 'library',
				resourceBundleName = 'resources'

			var sendLoadingProgress = createSendLoadingProgress( sendMessageToEditor )

			eventManager.waitFor(
				[ Events.RESOURCE_LOADING_COMPLETED, libraryBundleName ],
				function( loadedLibrary ) {
					addNamespaceAndName( loadedLibrary )

					var library = groupByType( loadedLibrary )

					_.extend( spell.scenes, addIdAsKey( library.scene ) )

					_.extend( spell.assets, createAssets( library.asset ) )
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

			// start loading library definition files
			resourceLoader.load(
				libraryIdsToJsonFilenames( runtimeModule.libraryIds ),
				libraryBundleName
			)
		}
	}
)

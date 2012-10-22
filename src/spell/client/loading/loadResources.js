define(
	'spell/client/loading/loadResources',
	[
		'spell/client/util/createAssets',
		'spell/client/loading/addNamespaceAndName',
		'spell/client/loading/createFilesToLoad',
		'spell/client/loading/injectResource',
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',
		'spell/functions'
	],
	function(
		createAssets,
		addNamespaceAndName,
		createFilesToLoad,
		injectResource,
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

		var isAsset = function( libraryRecord ) {
			return libraryRecord.type === 'asset'
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

					var loadedAssets     = _.filter( loadedLibrary, isAsset ),
						loadedOtherStuff = _.reject( loadedLibrary, isAsset )

					_.extend( spell.assets, createAssets( loadedAssets ) )

					resourceLoader.load( createFilesToLoad( loadedAssets ), resourceBundleName )

					// separate the other stuff according to type
					var otherStuff = _.reduce(
						loadedOtherStuff,
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

					addTemplates( templateManager, otherStuff.component )
					addTemplates( templateManager, otherStuff.entityTemplate )
					addTemplates( templateManager, otherStuff.system )

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

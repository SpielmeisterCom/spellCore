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


		var resourceIdsToJsonFilenames = function( resourceIds ) {
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


		return function( spell, next ) {
			var eventManager     = spell.eventManager,
				renderingContext = spell.renderingContext,
				resourceLoader   = spell.resourceLoader,
				resources        = spell.resources,
				runtimeModule    = spell.runtimeModule,
				templateManager  = spell.templateManager

			var templateBundleName = 'templates',
				assetBundleName    = 'assets',
				resourceBundleName = 'resources'

			eventManager.waitFor(
				[ Events.RESOURCE_LOADING_COMPLETED, assetBundleName ],
				function( loadedAssets ) {
					addNamespaceAndName( loadedAssets )

					_.extend( spell.assets, createAssets( loadedAssets ) )

					// start loading template definition files
					resourceLoader.load(
						resourceIdsToJsonFilenames( runtimeModule.templateIds ),
						templateBundleName
					)

					// start loading resources
					resourceLoader.load(
						createFilesToLoad( loadedAssets ),
						resourceBundleName
					)
				}

			).and(
				[ Events.RESOURCE_LOADING_COMPLETED, templateBundleName ],
				function( loadedTemplates ) {
					addNamespaceAndName( loadedTemplates )

					// separate templates according to type
					var templates = _.reduce(
						loadedTemplates,
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

					addTemplates( templateManager, templates.component )
					addTemplates( templateManager, templates.entityTemplate )
					addTemplates( templateManager, templates.system )
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
				next()
			} )

			// start loading asset definition files
			resourceLoader.load(
				resourceIdsToJsonFilenames( runtimeModule.assetIds ),
				assetBundleName
			)
		}
	}
)

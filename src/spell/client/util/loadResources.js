define(
	'spell/client/util/loadResources',
	[
		'spell/client/util/createAssets',
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',
		'spell/functions'
	],
	function(
		createAssets,
		Events,
		PlatformKit,
		_
	) {
		'use strict'


		var startLoadingResources = function( resourceLoader, resourceBundleId, resourceIds, baseUrl, type, afterLoad ) {
			resourceLoader.addResourceBundle(
				resourceBundleId,
				resourceIds,
				{
					baseUrl   : baseUrl,
					type      : type,
					afterLoad : afterLoad
				}
			)

			resourceLoader.start()
		}

		var resourceIdsToJsonFilenames = function( resourceIds ) {
			return _.map(
				resourceIds,
				function( resourceId ) {
					return resourceId.replace( /\./g, '/' ) + '.json'
				}
			)
		}

		var resourceJsonDecoder = function( resource ) {
			return PlatformKit.jsonCoder.decode( resource )
		}

		var traceResourceIds = function( assets ) {
			return _.unique(
				_.reduce(
					assets,
					function( memo, asset ) {
						return asset.resourceId ? memo.concat( asset.resourceId ) : memo
					},
					[]
				)
			)
		}

		var injectResource = function( resources, asset ) {
			if( !asset.resourceId ) return

			var resource = resources[ asset.resourceId ]

			if( !resource ) throw 'Error: Could not resolve resource id \'' + asset.resourceId + '\'.'

			asset.resource = resource
		}


		return function( spell, next ) {
			var eventManager     = spell.eventManager,
				renderingContext = spell.renderingContext,
				resourceLoader   = spell.resourceLoader,
				resources        = spell.resources,
				runtimeModule    = spell.runtimeModule,
				templateManager  = spell.templateManager

			var templateBundleId = 'templates',
				assetBundleId    = 'assets',
				resourceBundleId = 'resources'

			eventManager.waitFor(
				[ Events.RESOURCE_LOADING_COMPLETED, assetBundleId ],
				function( loadedAssets ) {
					_.extend( spell.assets, createAssets( loadedAssets ) )

					// start loading template definition files
					startLoadingResources(
						resourceLoader,
						templateBundleId,
						resourceIdsToJsonFilenames( runtimeModule.templateIds ),
						'library/templates',
						'text',
						resourceJsonDecoder
					)

					// start loading resources
					startLoadingResources(
						resourceLoader,
						resourceBundleId,
						traceResourceIds( spell.assets ),
						'library/assets',
						'image',
						function( resource ) {
							return renderingContext.createTexture( resource )
						}
					)
				}

			).and(
				[ Events.RESOURCE_LOADING_COMPLETED, templateBundleId ],
				function( loadedTemplates ) {
					_.each( loadedTemplates, function( template ) { templateManager.add( template ) } )
				}

			).and(
				[ Events.RESOURCE_LOADING_COMPLETED, resourceBundleId ],
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
			startLoadingResources(
				resourceLoader,
				assetBundleId,
				resourceIdsToJsonFilenames( runtimeModule.assetIds ),
				'library/assets',
				'text',
				resourceJsonDecoder
			)
		}
	}
)

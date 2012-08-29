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


		return function( spell, next ) {
			var eventManager     = spell.eventManager,
				renderingContext = spell.renderingContext,
				resourceLoader   = spell.resourceLoader,
				runtimeModule    = spell.runtimeModule,
				templateManager  = spell.templateManager

			var templateBundleId = 'templates',
				assetBundleId    = 'assets',
				resourceBundleId = 'resources'

			eventManager.waitFor(
				[ Events.RESOURCE_LOADING_COMPLETED, templateBundleId ],
				function( templates ) {
					_.each( templates, function( template ) { templateManager.add( template ) } )
				}

			).and(
				[ Events.RESOURCE_LOADING_COMPLETED, assetBundleId ],
				function( assets ) {
					spell.assets = createAssets( assets )

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
				[ Events.RESOURCE_LOADING_COMPLETED, resourceBundleId ]

			).resume( function() {
				next()
			} )

			startLoadingResources(
				resourceLoader,
				templateBundleId,
				resourceIdsToJsonFilenames( runtimeModule.templateIds ),
				'library/templates',
				'text',
				resourceJsonDecoder
			)

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

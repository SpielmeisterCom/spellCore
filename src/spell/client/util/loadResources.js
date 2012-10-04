define(
	'spell/client/util/loadResources',
	[
		'spell/client/util/createAssets',
		'spell/shared/util/createIdFromLibraryFilePath',
		'spell/shared/util/createLibraryFilePath',
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',
		'spell/functions'
	],
	function(
		createAssets,
		createIdFromLibraryFilePath,
		createLibraryFilePath,
		Events,
		PlatformKit,
		_
	) {
		'use strict'


		var startLoadingResources = function( resourceLoader, resourceBundleId, resourceIds, type, afterLoad ) {
			resourceLoader.addResourceBundle(
				resourceBundleId,
				resourceIds,
				{
					baseUrl   : 'library',
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

		var createFilesToLoad = function( assets ) {
			return _.unique(
				_.reduce(
					assets,
					function( memo, asset ) {
						return asset.file ?
							memo.concat( createLibraryFilePath( asset.namespace, asset.file ) ) :
							memo
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

		var addTemplates = function( templateManager, templates ) {
			_.each(
				templates,
				function( template ) {
					templateManager.add( template )
				}
			)
		}

		/**
		 * Adds the namespace and name attribute to library records.
		 *
		 * @param records
		 */
		var addNamespaceAndName = function( records ) {
			_.each(
				records,
				function( value, key ) {
					var idParts = createIdFromLibraryFilePath( key, true )

					value.name      = idParts.pop()
					value.namespace = idParts.join( '.' )
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

			var templateBundleId = 'templates',
				assetBundleId    = 'assets',
				resourceBundleId = 'resources'

			eventManager.waitFor(
				[ Events.RESOURCE_LOADING_COMPLETED, assetBundleId ],
				function( loadedAssets ) {
					addNamespaceAndName( loadedAssets )

					_.extend( spell.assets, createAssets( loadedAssets ) )

					// start loading template definition files
					startLoadingResources(
						resourceLoader,
						templateBundleId,
						resourceIdsToJsonFilenames( runtimeModule.templateIds ),
						'text',
						resourceJsonDecoder
					)

					// start loading resources
					startLoadingResources(
						resourceLoader,
						resourceBundleId,
						createFilesToLoad( loadedAssets ),
						'image',
						function( resource ) {
							return renderingContext.createTexture( resource )
						}
					)
				}

			).and(
				[ Events.RESOURCE_LOADING_COMPLETED, templateBundleId ],
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
					addTemplates( templateManager, templates.entity )
					addTemplates( templateManager, templates.system )
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
				'text',
				resourceJsonDecoder
			)
		}
	}
)

define(
	'spell/client/loading/ResourceLoader',
	[
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/Events',

		'spell/functions'
	],
	function(
		PlatformKit,
		Events,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var BASE_URL     = 'library',
			nextBundleId = 0


		var createBundleId = function() {
			return nextBundleId++
		}

		var resourceJsonDecoder = function( resource ) {
			return PlatformKit.jsonCoder.decode( resource )
		}

		var resourceImageDecoder = function( renderingContext, resource ) {
			return renderingContext.createTexture( resource )
		}

		var resourceSoundDecoder = function( audioContext, resource ) {
			return audioContext.createSound( resource )
		}

		var getResourceType = function( resourceTypes, resourceName, type ) {
			var type = type === 'auto' ?
				_.last( resourceName.split( '.' ) ) :
				type

			for( var i = 0, numEntries = resourceTypes.length; i < numEntries; i++ ) {
				var resourceType = resourceTypes[ i ]

				if( _.contains( resourceType.types, type ) ) {
					return resourceType
				}
			}
		}

		var createResourceBundle = function( config, id, name, resources ) {
			return {
				processOnLoad      : config.processOnLoad,
				baseUrl            : config.baseUrl,
				id                 : id,
				name               : name,
				omitCache          : config.omitCache,
				onLoadingCompleted : config.onLoadingCompleted,
				resources          : resources,
				resourcesTotal     : resources.length,
				resourcesCompleted : 0,
				type               : config.type
			}
		}

		/*
		 * Returns true if a resource bundle with the provided name exists, false otherwise.
		 *
		 * @param resourceBundles
		 * @param name
		 */
		var resourceBundleExists = function( resourceBundles, name ) {
			if( !name ) return false

			return _.any(
				resourceBundles,
				function( resourceBundle ) {
					return resourceBundle.name === name
				}
			)
		}

		var updateProgress = function( eventManager, cache, resourceBundles, resourceBundle ) {
			resourceBundle.resourcesCompleted++

			var name = resourceBundle.name

			if( name ) {
				var progress = resourceBundle.resourcesCompleted / resourceBundle.resourcesTotal

				eventManager.publish(
					[ Events.RESOURCE_PROGRESS, resourceBundle.name ],
					[ progress, resourceBundle.resourcesCompleted, resourceBundle.resourcesTotal ]
				)
			}

			if( resourceBundle.resourcesCompleted === resourceBundle.resourcesTotal ) {
				if( name ) {
					eventManager.publish(
						[ Events.RESOURCE_LOADING_COMPLETED, name ],
						[ _.pick( cache, resourceBundle.resources ) ]
					)
				}

				var onLoadingCompleted = resourceBundle.onLoadingCompleted

				if( onLoadingCompleted ) onLoadingCompleted()

				delete resourceBundles[ resourceBundle.id ]
			}
		}

		var onLoadCallback = function( eventManager, cache, processOnLoad, resourceBundles, resourceBundle, resourceName, loadedResource ) {
			if( !loadedResource ) {
				throw 'Error: Resource \'' + resourceName + '\' from resource bundle \'' + resourceBundle.id + '\' is undefined or empty on loading completed.'
			}

			cache[ resourceName ] = processOnLoad( loadedResource )

			updateProgress( eventManager, cache, resourceBundles, resourceBundle )
		}

		var onErrorCallback = function( eventManager, cache, resourceBundles, resourceBundle, resourceName ) {
			throw 'Error: Loading resource \'' + resourceName + '\' failed.'
		}

		var onTimedOutCallback = function( eventManager, cache, resourceBundles, resourceBundle, resourceName ) {
			throw 'Error: Loading resource \'' + resourceName + '\' timed out.'
		}

		var createLoader = function( host, loaderFactory, baseUrl, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			var resourcePath = baseUrl

			return loaderFactory( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback )
		}

		var startLoadingResourceBundle = function( cache, eventManager, resourceTypes, host, resourceBundles, resourceBundle ) {
			var omitCache = resourceBundle.omitCache

			_.each(
				resourceBundle.resources,
				function( resourceName ) {
					if( !omitCache ) {
						var cacheEntry = cache[ resourceName ]

						if( cacheEntry ) {
							onLoadCallback( eventManager, cache, _.identity, resourceBundles, resourceBundle, resourceName, cacheEntry )

							return
						}
					}

					var resourceType  = getResourceType( resourceTypes, resourceName, resourceBundle.type ),
						processOnLoad = resourceBundle.processOnLoad || resourceType.processOnLoad

					if( !resourceType ) {
						throw 'Error: Unable to load resource of type \'' + resourceBundle.type + '\'.'
					}

					var loader = createLoader(
						host,
						resourceType.factory,
						resourceBundle.baseUrl,
						resourceName,
						_.bind( onLoadCallback, null, eventManager, cache, processOnLoad, resourceBundles, resourceBundle, resourceName ),
						_.bind( onErrorCallback, null, eventManager, cache, resourceBundles, resourceBundle, resourceName ),
						_.bind( onTimedOutCallback, null, eventManager, cache, resourceBundles, resourceBundle, resourceName )
					)

					if( !loader ) {
						throw 'Could not create a loader for resource \'' + resourceName + '\'.'
					}

					loader.start()
				}
			)
		}

		var normalizeConfig = function( config ) {
			return {
				processOnLoad      : _.isFunction( config.processOnLoad ) ? config.processOnLoad : undefined,
				baseUrl            : config.baseUrl ? config.baseUrl : BASE_URL,
				name               : config.name,
				omitCache          : !!config.omitCache,
				onLoadingCompleted : config.onLoadingCompleted,
				type               : config.type ? config.type : 'auto'
			}
		}


		/*
		 * public
		 */

		var ResourceLoader = function( spell, eventManager, renderingContext, soundContext, hostConfig ) {
			this.eventManager    = eventManager
			this.resourceBundles = {}
			this.cache           = {}
			this.host            = ( hostConfig.type === 'internal' ? '' : 'http://' + hostConfig.host )

			this.resourceTypes = [
				{
					factory       : PlatformKit.createImageLoader,
					processOnLoad : _.bind( resourceImageDecoder, null, renderingContext ),
					types         : [ 'jpeg', 'png' ]
				},
				{
					factory       : PlatformKit.createTextLoader,
					processOnLoad : resourceJsonDecoder,
					types         : [ 'json' ]
				},
				{
					factory       : PlatformKit.createSoundLoader,
					processOnLoad :  _.bind( resourceSoundDecoder, null, soundContext ),
					types         : [ 'mp3', 'wav', 'ogg' ]
				}
			]
		}

		var load = function( cache, eventManager, host, resourceBundles, resourceTypes, resourcesToLoad, name, config ) {
			var id             = createBundleId(),
				resourceBundle = createResourceBundle( config, id, name, resourcesToLoad )

			resourceBundles[ id ] = resourceBundle

			startLoadingResourceBundle( cache, eventManager, resourceTypes, host, resourceBundles, resourceBundle )
		}

		ResourceLoader.prototype = {
			getCache: function() {
				return this.cache
			},

			setCache: function( content ) {
				this.cache = content
			},

			load: function( resourcesToLoad ) {
				var numArguments = _.size( arguments ),
					config       = {},
					name

				if( numArguments > 2 ) {
					// ( resourcesToLoad : String, name : String, config : Object )
					name   = arguments[ 1 ]
					config = arguments[ 2 ]

				} else if( numArguments > 1 ) {
					var arg1 = arguments[ 1 ]

					if( _.isObject( arg1 ) ) {
						// ( resourcesToLoad : String, config : Object )
						config = arg1

					} else {
						// ( resourcesToLoad : String, name : String )
						name = arg1
					}
				}

				if( _.size( resourcesToLoad ) === 0 ) {
					throw 'Error: The resource bundle \'' + name + '\' contains no resources.'
				}

				if( name && resourceBundleExists( this.resourceBundles, name ) ) {
					throw 'Error: A resource bundle with the \'' + name + '\' already exists.'
				}

				load(
					this.cache,
					this.eventManager,
					this.host,
					this.resourceBundles,
					this.resourceTypes,
					resourcesToLoad,
					name,
					normalizeConfig( config )
				)
			}
		}

		return ResourceLoader
	}
)

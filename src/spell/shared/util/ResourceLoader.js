define(
	'spell/shared/util/ResourceLoader',
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

		var STATE_WAITING_FOR_PROCESSING = 0
		var STATE_PROCESSING = 1
		var STATE_COMPLETED = 2

		var BASE_URL = 'library'

		var extensionToLoaderFactory = {
			'image' : PlatformKit.createImageLoader,
			'text'  : PlatformKit.createTextLoader
		}


		var createResourceBundle = function( name, resources, config ) {
			return {
				afterLoad             : config.afterLoad,
				baseUrl               : config.baseUrl,
				name                  : name,
				resources             : resources,
				resourcesTotal        : resources.length,
				resourcesNotCompleted : resources.length,
				state                 : STATE_WAITING_FOR_PROCESSING,
				type                  : config.type
			}
		}

		/*
		 * Returns true if a resource bundle with the provided name exists, false otherwise.
		 *
		 * @param resourceBundles
		 * @param name
		 */
		var resourceBundleExists = function( resourceBundles, name ) {
			return _.has( resourceBundles, name )
		}

		var updateProgress = function( resourceBundle ) {
			resourceBundle.resourcesNotCompleted -= 1

			var progress = 1.0 - resourceBundle.resourcesNotCompleted / resourceBundle.resourcesTotal

			this.eventManager.publish(
				[ Events.RESOURCE_PROGRESS, resourceBundle.name ],
				[ progress ]
			)

			if( resourceBundle.resourcesNotCompleted === 0 ) {
				resourceBundle.state = STATE_COMPLETED

				this.eventManager.publish(
					[ Events.RESOURCE_LOADING_COMPLETED, resourceBundle.name ],
					[ _.pick( this.cache, resourceBundle.resources ) ]
				)
			}
		}

		var checkResourceAlreadyLoaded = function( loadedResource, resourceName ) {
			if( !_.has( this.cache, resourceName ) ) return

			throw 'Error: Resource "' + resourceName + '" already loaded.'
		}

		var resourceLoadingCompletedCallback = function( resourceBundleName, resourceName, loadedResource ) {
			if( !loadedResource ) {
				throw 'Resource "' + resourceName + '" from resource bundle "' + resourceBundleName + '" is undefined or empty on loading completed.'
			}

//			// making sure the loaded resource was not already returned earlier
//			checkResourceAlreadyLoaded.call( this, loadedResource, resourceName )

			var resourceBundle = this.resourceBundles[ resourceBundleName ]

			// add newly loaded resources to cache, run trough afterLoad callback if available
			this.cache[ resourceName ] = resourceBundle.afterLoad ?
				resourceBundle.afterLoad( loadedResource ) :
				loadedResource

			updateProgress.call( this, resourceBundle )
		}

		var resourceLoadingTimedOutCallback = function( logger, resourceBundleName, resourceName ) {
			logger.debug( 'Loading "' + resourceName + '" failed with a timeout. In case the execution environment is safari this message can be ignored.' )

			updateProgress.call( this, this.resourceBundles[ resourceBundleName ] )
		}

		var createLoader = function(
			eventManager,
			host,
			baseUrl,
			resourceBundleName,
			resourceName,
			loadingCompletedCallback,
			loadingTimedOutCallback,
			soundManager,
			renderingContext,
			type
		) {
			var extension = ( type === 'auto' ?
				_.last( resourceName.split( '.' ) )
				: type
			)

			var loaderFactory = extensionToLoaderFactory[ extension ]

			if( loaderFactory === undefined ) {
				throw 'Could not create loader factory for resource "' + resourceName + '".'
			}

			var resourcePath = baseUrl

			var loader = loaderFactory(
				eventManager,
				resourcePath,
				resourceBundleName,
				resourceName,
				loadingCompletedCallback,
				loadingTimedOutCallback,
				( extension === 'json' ?
					soundManager :
					( extension === 'jpg' || extension === 'png' ?
						renderingContext :
						undefined
					)
				)
			)

			return loader
		}

		var startLoadingResourceBundle = function( logger, resourceBundle ) {
			_.each(
				resourceBundle.resources,
				_.bind(
					function( resourceName ) {
						var cachedEntry = this.cache[ resourceName ]

						if( cachedEntry ) {
							resourceLoadingCompletedCallback.call(
								this,
								resourceBundle.name,
								resourceName,
								cachedEntry
							)

							return
						}

						var loader = createLoader(
							this.eventManager,
							this.host,
							resourceBundle.baseUrl,
							resourceBundle.name,
							resourceName,
							_.bind( resourceLoadingCompletedCallback, this, resourceBundle.name, resourceName ),
							_.bind( resourceLoadingTimedOutCallback, this, logger, resourceBundle.name, resourceName ),
                            this.soundManager,
							this.renderingContext,
							resourceBundle.type
						)

						if( loader !== undefined ) {
							loader.start()

						} else {
							throw 'Could not create a loader for resource "' + resourceName + '".'
						}
					},
					this
				)
			)
		}

		var normalizeConfig = function( config ) {
			return {
				afterLoad : _.isFunction( config.afterLoad ) ? config.afterLoad : undefined,
				baseUrl   : config.baseUrl ? config.baseUrl : BASE_URL,
				type      : config.type ? config.type : 'auto'
			}
		}


		/*
		 * public
		 */

		var ResourceLoader = function( spell, soundManager, renderingContext, eventManager, hostConfig ) {
			if( eventManager === undefined ) throw 'Argument "eventManager" is undefined.'
            if( soundManager === undefined ) throw 'Argument "soundManager" is undefined.'

            this.soundManager = soundManager
			this.renderingContext = renderingContext
			this.eventManager = eventManager
			this.resourceBundles = {}
			this.cache = {}
			this.host = ( hostConfig.type === 'internal' ? '' : 'http://' + hostConfig.host )
		}

		ResourceLoader.prototype = {
			addResourceBundle: function( name, resources, config ) {
				if( _.size( resources ) === 0 ) {
					throw 'Resource group with name "' + name + '" has zero assigned resources.'
				}

				if( resourceBundleExists( this.resourceBundles, name ) ) {
					throw 'Resource group with name "' + name + '" already exists.'
				}

				this.resourceBundles[ name ] = createResourceBundle(
					name,
					resources,
					normalizeConfig( config )
				)
			},

			getResources: function() {
				return this.cache
			},

			setCache: function( content ) {
				this.cache = content
			},

			start: function() {
				_.each(
					this.resourceBundles,
					_.bind(
						function( resourceBundle ) {
							if( resourceBundle.state !== STATE_WAITING_FOR_PROCESSING ) return

							resourceBundle.state = STATE_PROCESSING
							startLoadingResourceBundle.call( this, this.logger, resourceBundle )
						},
						this
					)
				)
			}
		}

		return ResourceLoader
	}
)

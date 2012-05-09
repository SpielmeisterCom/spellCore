define(
	'spell/shared/util/ResourceLoader',
	[
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/Events',
		'spell/shared/util/Logger',

		'underscore'
	],
	function(
		PlatformKit,
		Events,
		Logger,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var STATE_WAITING_FOR_PROCESSING = 0
		var STATE_PROCESSING = 1
		var STATE_COMPLETED = 2

		var RESOURCE_PATH = 'output/resources'

		var extensionToLoaderFactory = {
			'png'  : PlatformKit.createImageLoader,
			'jpg'  : PlatformKit.createImageLoader,
			'json' : PlatformKit.createSoundLoader,
			'txt'  : PlatformKit.createTextLoader
		}


		var createResourceBundle = function( name, resources ) {
			return {
				name                  : name,
				state                 : STATE_WAITING_FOR_PROCESSING,
				resources             : resources,
				resourcesTotal        : resources.length,
				resourcesNotCompleted : resources.length
			}
		}

		/**
		 * Returns true if a resource bundle with the provided name exists, false otherwise.
		 *
		 * @param resourceBundles
		 * @param name
		 */
		var resourceBundleExists = function( resourceBundles, name ) {
			return _.has( resourceBundles, name )
		}

		/**
		 * Returns true if a resource with the provided name exists, false otherwise.
		 *
		 * @param resources
		 * @param resourceName
		 */
		var isResourceInCache = function( resources, resourceName ) {
			return _.has( resources, resourceName )
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

				this.eventManager.publish( [ Events.RESOURCE_LOADING_COMPLETED, resourceBundle.name ] )
			}
		}

		var checkResourceAlreadyLoaded = function( loadedResources, resourceName ) {
			_.each(
				loadedResources,
				_.bind(
					function( loadedResource, loadedResourceName ) {
						if( !_.has( this.resources, loadedResourceName ) ) return

						throw 'Error: sub-resource "' + loadedResourceName + '" from resource "' + resourceName + '" already exists.'
					},
					this
				)
			)
		}

		var resourceLoadingCompletedCallback = function( resourceBundleName, resourceName, loadedResources ) {
			if( loadedResources === undefined ||
				_.size( loadedResources ) === 0 ) {

				throw 'Resource "' + resourceName + '" from resource bundle "' + resourceBundleName + '" is undefined or empty on loading completed.'
			}

			// making sure the loaded resources were not already returned earlier
			checkResourceAlreadyLoaded.call( this, loadedResources, resourceName )

			// add newly loaded resources to cache
			_.extend( this.resources, loadedResources )

			updateProgress.call( this, this.resourceBundles[ resourceBundleName ] )
		}

		var resourceLoadingTimedOutCallback = function( resourceBundleName, resourceName ) {
			Logger.debug( 'Loading "' + resourceName + '" failed with a timeout. In case the execution environment is safari this message can be ignored.' )

			updateProgress.call( this, this.resourceBundles[ resourceBundleName ] )
		}

		var createLoader = function( eventManager, host, resourceBundleName, resourceName, loadingCompletedCallback, loadingTimedOutCallback, soundManager ) {
			var extension = _.last( resourceName.split( '.' ) )
			var loaderFactory = extensionToLoaderFactory[ extension ]

			if( loaderFactory === undefined ) {
				throw 'Could not create loader factory for resource "' + resourceName + '".'
			}

			var resourcePath = host + '/' + RESOURCE_PATH

			var loader = loaderFactory(
				eventManager,
				resourcePath,
				resourceBundleName,
				resourceName,
				loadingCompletedCallback,
				loadingTimedOutCallback,
                ( extension === 'json' ) ? soundManager : undefined
			)

			return loader
		}

		var startLoadingResourceBundle = function( resourceBundle ) {
			_.each(
				resourceBundle.resources,
				_.bind(
					function( resourceName ) {
						if( isResourceInCache( this.resources, resourceName ) ) {
							updateProgress.call( this, resourceBundle )

							return
						}

						var loader = createLoader(
							this.eventManager,
							this.host,
							resourceBundle.name,
							resourceName,
							_.bind( resourceLoadingCompletedCallback, this, resourceBundle.name, resourceName ),
							_.bind( resourceLoadingTimedOutCallback, this, resourceBundle.name, resourceName ),
                            this.soundManager
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


		/**
		 * public
		 */

		var ResourceLoader = function( soundManager, eventManager, hostConfig ) {
			if( eventManager === undefined ) throw 'Argument "eventManager" is undefined.'
            if( soundManager === undefined ) throw 'Argument "soundManager" is undefined.'

            this.soundManager = soundManager
			this.eventManager = eventManager
			this.resourceBundles = {}
			this.resources = {}
			this.host = ( hostConfig.type === 'internal' ? '' : 'http://' + hostConfig.host )
		}

		ResourceLoader.prototype = {
			addResourceBundle: function( name, resources ) {
				if( _.size( resources ) === 0 ) {
					throw 'Resource group with name "' + name + '" has zero assigned resources.'
				}

				if( resourceBundleExists( this.resourceBundles, name ) ) {
					throw 'Resource group with name "' + name + '" already exists.'
				}


				this.resourceBundles[ name ] = createResourceBundle(
					name,
					resources
				)
			},

			start: function() {
				_.each(
					this.resourceBundles,
					_.bind(
						function( resourceBundle ) {
							if( resourceBundle.state !== STATE_WAITING_FOR_PROCESSING ) return

							resourceBundle.state = STATE_PROCESSING
							startLoadingResourceBundle.call( this, resourceBundle )
						},
						this
					)
				)
			},

			getResources: function() {
				return this.resources
			}
		}

		return ResourceLoader
	}
)

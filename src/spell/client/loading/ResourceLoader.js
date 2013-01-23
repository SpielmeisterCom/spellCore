define(
	'spell/client/loading/ResourceLoader',
	[
		'spell/shared/util/platform/PlatformKit',
		'spell/Events',

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

		var BASE_URL             = 'library',
			nextLoadingProcessId = 0

		var createLoadingProcessId = function() {
			return nextLoadingProcessId++
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

		var createResourceTypes = function( renderingContext, soundContext ) {
			var imageType = {
				factory       : PlatformKit.createImageLoader,
				processOnLoad : _.bind( resourceImageDecoder, null, renderingContext )
			}

			var soundType = {
				factory       : PlatformKit.createSoundLoader,
				processOnLoad : _.bind( resourceSoundDecoder, null, soundContext )
			}

			var textType = {
				factory       : PlatformKit.createTextLoader,
				processOnLoad : resourceJsonDecoder
			}

			return {
				jpeg : imageType,
				png  : imageType,
				mp3  : soundType,
				wav  : soundType,
				ogg  : soundType,
				json : textType
			}
		}

		var getResourceType = function( resourceTypes, type, libraryPath ) {
			if( type === 'auto' ) {
				type = _.last( libraryPath.split( '.' ) )
			}

			return resourceTypes[ type ]
		}

		var createLoadingProcess = function( id, libraryPaths, config ) {
			return {
				id                 : id,
				libraryPaths       : libraryPaths,
				numCompleted       : 0,
				name               : config.name,
				type               : config.type,
				processOnLoad      : config.processOnLoad,
				baseUrl            : config.baseUrl,
				omitCache          : config.omitCache,
				onLoadingCompleted : config.onLoadingCompleted,
				isMetaDataLoad     : config.isMetaDataLoad
			}
		}

		var updateProgress = function( eventManager, cache, loadingProcesses, loadingProcess ) {
			loadingProcess.numCompleted++

			var libraryPaths    = loadingProcess.libraryPaths,
				numLibraryPaths = libraryPaths.length,
				progress        = loadingProcess.numCompleted / numLibraryPaths

			eventManager.publish(
				[ Events.RESOURCE_PROGRESS, loadingProcess.name ],
				[ progress, loadingProcess.numCompleted, numLibraryPaths ]
			)

			if( loadingProcess.numCompleted === numLibraryPaths ) {
				var loadedLibraryRecords = _.pick( cache, libraryPaths )

				if( loadingProcess.name ) {
					eventManager.publish(
						[ Events.RESOURCE_LOADING_COMPLETED, loadingProcess.name ],
						[ loadedLibraryRecords ]
					)
				}

				var onLoadingCompleted = loadingProcess.onLoadingCompleted

				if( onLoadingCompleted ) {
					onLoadingCompleted( loadedLibraryRecords )
				}

				delete loadingProcesses[ loadingProcess.id ]
			}
		}

		var onLoadCallback = function( eventManager, cache, processOnLoad, loadingProcesses, loadingProcess, libraryPath, loadedResource ) {
			if( !loadedResource ) {
				throw 'Error: Resource "' + libraryPath + '" from loading process "' + loadingProcess.id + '" is undefined or empty on loading completed.'
			}

			cache[ libraryPath ] = processOnLoad( loadedResource )

			updateProgress( eventManager, cache, loadingProcesses, loadingProcess )
		}

		var onErrorCallback = function( eventManager, cache, loadingProcesses, loadingProcess, resourceName ) {
			throw 'Error: Loading resource "' + resourceName + '" failed.'
		}

		var onTimedOutCallback = function( eventManager, cache, loadingProcesses, loadingProcess, resourceName ) {
			throw 'Error: Loading resource "' + resourceName + '" timed out.'
		}

		var createLoader = function( host, loaderFactory, baseUrl, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			var resourcePath = baseUrl

			return loaderFactory( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback )
		}

		var startLoadingProcess = function( cache, eventManager, resourceTypes, host, loadingProcesses, loadingProcess ) {
			var omitCache    = loadingProcess.omitCache,
				libraryPaths = loadingProcess.libraryPaths

			for( var i = 0, n = libraryPaths.length; i < n; i++ ) {
				var libraryPath = libraryPaths[ i ]

				if( !omitCache ) {
					var cachedEntry = cache[ libraryPath ]

					if( cachedEntry ) {
						onLoadCallback( eventManager, cache, _.identity, loadingProcesses, loadingProcess, libraryPath, cachedEntry )

						continue
					}
				}

				var resourceType  = getResourceType( resourceTypes, loadingProcess.type, libraryPath )

				if( !resourceType ) {
					throw 'Error: Unable to load resource of type "' + loadingProcess.type + '".'
				}

				var processOnLoad = loadingProcess.processOnLoad || resourceType.processOnLoad

				var loader = createLoader(
					host,
					resourceType.factory,
					loadingProcess.baseUrl,
					libraryPath,
					_.bind( onLoadCallback, null, eventManager, cache, processOnLoad, loadingProcesses, loadingProcess, libraryPath ),
					_.bind( onErrorCallback, null, eventManager, cache, loadingProcesses, loadingProcess, libraryPath ),
					_.bind( onTimedOutCallback, null, eventManager, cache, loadingProcesses, loadingProcess, libraryPath )
				)

				if( !loader ) {
					throw 'Could not create a loader for resource "' + libraryPath + '".'
				}

				loader.start()
			}
		}

		var createConfig = function( baseUrlPrefix, config ) {
			return {
				processOnLoad      : _.isFunction( config.processOnLoad ) ? config.processOnLoad : undefined,
				baseUrl            : config.baseUrl ? config.baseUrl : baseUrlPrefix + BASE_URL,
				name               : config.name,
				omitCache          : !!config.omitCache,
				onLoadingCompleted : config.onLoadingCompleted,
				type               : config.type ? config.type : 'auto',
				isMetaDataLoad     : config.isMetaDataLoad !== undefined ? config.isMetaDataLoad : true
			}
		}


		/*
		 * public
		 */

		var ResourceLoader = function( spell, eventManager, renderingContext, soundContext, hostConfig, baseUrlPrefix ) {
			this.eventManager     = eventManager
			this.loadingProcesses = {}
			this.host             = hostConfig.type === 'internal' ? '' : 'http://' + hostConfig.host
			this.baseUrlPrefix    = baseUrlPrefix
			this.resourceTypes    = createResourceTypes( renderingContext, soundContext )

			this.cache = {
				metaData : {},
				resource : {}
			}
		}

		ResourceLoader.prototype = {
			get : function( libraryPath ) {
				var cache = this.cache

				return cache.metaData[ libraryPath ] || cache.resource[ libraryPath ]
			},

			setCache : function( content ) {
				_.extend( this.cache.metaData, content )
			},

			free : function() {
				this.cache.resource = {}
			},

			load : function( libraryPaths, config ) {
				if( libraryPaths.length === 0 ) {
					throw 'Error: No library paths provided.'
				}

				var id = createLoadingProcessId()

				var loadingProcess = createLoadingProcess(
					id,
					libraryPaths,
					createConfig( this.baseUrlPrefix, config )
				)

				startLoadingProcess(
					loadingProcess.isMetaDataLoad ? this.cache.metaData : this.cache.resource,
					this.eventManager,
					this.resourceTypes,
					this.host,
					this.loadingProcesses,
					loadingProcess
				)

				this.loadingProcesses[ id ] = loadingProcess

				return id
			}
		}

		return ResourceLoader
	}
)

define(
	'spell/LibraryManager',
	[
		'spell/client/loading/addNamespaceAndName',
		'spell/shared/util/createLibraryFilePath',
		'spell/shared/util/createLibraryFilePathFromId',
		'spell/shared/util/platform/PlatformKit',
		'spell/Events',

		'spell/functions'
	],
	function(
		addNamespaceAndName,
		createLibraryFilePath,
		createLibraryFilePathFromId,
		PlatformKit,
		Events,

		_
	) {
		'use strict'


		var BASE_URL             = 'library',
			nextLoadingProcessId = 0

		var createLoadingProcessId = function() {
			return nextLoadingProcessId++
		}

		var resourceJsonDecoder = function( resource ) {
			return PlatformKit.jsonCoder.decode( resource )
		}

		var createResourceTypeToLoaderFactory = function( renderingContext, soundContext ) {
			var createTexture = _.bind( PlatformKit.createImageLoader, null, renderingContext ),
				createSound   = _.bind( PlatformKit.createSoundLoader, null, soundContext ),
				createText    = _.bind( PlatformKit.createTextLoader, null, resourceJsonDecoder )

			return {
				jpeg : createTexture,
				png  : createTexture,
				mp3  : createSound,
				wav  : createSound,
				ogg  : createSound,
				json : createText
			}
		}

		var getLoaderFactory = function( resourceTypeToLoaderFactory, type, libraryPath ) {
			if( type === 'auto' ) {
				if( _.isObject( libraryPath ) ) {
					type = _.last( libraryPath.libraryPath.split( '.' ) )

				} else {
					type = _.last( libraryPath.split( '.' ) )
				}
			}

			return resourceTypeToLoaderFactory[ type ]
		}

		var createLoadingProcess = function( id, libraryPaths, baseUrlPrefix, config, next ) {
			return {
				id                 : id,
				libraryPaths       : libraryPaths,
				numCompleted       : 0,
				name               : config.name,
				next               : next,
				type               : config.type ? config.type : 'auto',
				baseUrl            : config.baseUrl ? config.baseUrl : baseUrlPrefix + BASE_URL,
				omitCache          : !!config.omitCache,
				onLoadingCompleted : config.onLoadingCompleted,
				isMetaDataLoad     : config.isMetaDataLoad !== undefined ? config.isMetaDataLoad : true
			}
		}

		var updateProgress = function( eventManager, cache, loadingProcesses, loadingProcess ) {
			loadingProcess.numCompleted++

			var libraryPaths    = loadingProcess.libraryPaths,
				numLibraryPaths = libraryPaths.length,
				progress        = loadingProcess.numCompleted / numLibraryPaths,
				name            = loadingProcess.name

			eventManager.publish(
				[ Events.RESOURCE_PROGRESS, name ],
				[ progress, loadingProcess.numCompleted, numLibraryPaths ]
			)

			if( loadingProcess.numCompleted === numLibraryPaths ) {
				var loadedLibraryRecords = _.reduce(
					libraryPaths,
					function( memo, value ) {
						if( _.isObject( value ) ) {
							memo[ value.libraryPath ] = cache[ value.libraryPath ]

						} else {
							memo[ value ] = cache[ value ]
						}

						return memo
					},
					{}
				)

				if( loadingProcess.isMetaDataLoad ) {
					addNamespaceAndName( loadedLibraryRecords )
				}

				if( loadingProcess.onLoadingCompleted ) {
					loadingProcess.onLoadingCompleted( loadedLibraryRecords )
				}

				delete loadingProcesses[ loadingProcess.id ]

				if( name ) {
					eventManager.publish(
						[ Events.RESOURCE_LOADING_COMPLETED, name ],
						[ loadedLibraryRecords ]
					)
				}

				if( loadingProcess.next ) {
					loadingProcess.next()
				}
			}
		}

		var onLoadCallback = function( eventManager, cache, loadingProcesses, loadingProcess, libraryPath, loadedResource ) {
			if( !loadedResource ) {
				throw 'Error: Resource "' + libraryPath + '" from loading process "' + loadingProcess.id + '" is undefined or empty on loading completed.'
			}

			cache[ libraryPath ] = loadedResource

			updateProgress( eventManager, cache, loadingProcesses, loadingProcess )
		}

		var onErrorCallback = function( eventManager, cache, loadingProcesses, loadingProcess, resourceName ) {
			throw 'Error: Loading resource "' + resourceName + '" failed.'
		}

		var onTimedOutCallback = function( eventManager, cache, loadingProcesses, loadingProcess, resourceName ) {
			throw 'Error: Loading resource "' + resourceName + '" timed out.'
		}

		var startLoadingProcess = function( cache, eventManager, resourceTypeToLoaderFactory, loadingProcesses, loadingProcess ) {
			var omitCache    = loadingProcess.omitCache,
				libraryPaths = loadingProcess.libraryPaths

			for( var i = 0, n = libraryPaths.length; i < n; i++ ) {
				var libraryPath = libraryPaths[ i ],
					libraryPathUrlUsedForLoading

				if( _.isObject( libraryPath ) ) {
					libraryPath = libraryPaths[ i ].libraryPath
					libraryPathUrlUsedForLoading = libraryPaths[ i ].libraryPathUrlUsedForLoading

				} else {
					libraryPathUrlUsedForLoading = libraryPath
				}

				if( !omitCache ) {
					var cachedEntry = cache[ libraryPath ]

					if( cachedEntry ) {
						onLoadCallback( eventManager, cache, loadingProcesses, loadingProcess, libraryPath, cachedEntry )

						continue
					}
				}

				var loaderFactory = getLoaderFactory( resourceTypeToLoaderFactory, loadingProcess.type, libraryPath )

				if( !loaderFactory ) {
					throw 'Error: Unable to load resource of type "' + loadingProcess.type + '".'
				}

				var loader = loaderFactory(
					loadingProcess.baseUrl,
					libraryPathUrlUsedForLoading,
					_.bind( onLoadCallback, null, eventManager, cache, loadingProcesses, loadingProcess, libraryPath ),
					_.bind( onErrorCallback, null, eventManager, cache, loadingProcesses, loadingProcess, libraryPath ),
					_.bind( onTimedOutCallback, null, eventManager, cache, loadingProcesses, loadingProcess, libraryPath )
				)

				if( !loader ) {
					throw 'Could not create a loader for resource "' + libraryPath + '".'
				}

				loader.start()
			}
		}


		var LibraryManager = function( eventManager, renderingContext, soundContext, hostConfig, baseUrlPrefix ) {
			this.eventManager                = eventManager
			this.loadingProcesses            = {}
			this.host                        = hostConfig.type === 'internal' ? '' : 'http://' + hostConfig.host
			this.baseUrlPrefix               = baseUrlPrefix
			this.resourceTypeToLoaderFactory = createResourceTypeToLoaderFactory( renderingContext, soundContext )

			this.cache = {
				metaData : {},
				resource : {}
			}
		}

		LibraryManager.prototype = {
			get : function( libraryPath ) {
				var cache = this.cache

				return cache.metaData[ libraryPath ] || cache.resource[ libraryPath ]
			},

			getMetaDataRecordsByType : function( type ) {
				return _.reduce(
					this.cache.metaData,
					function( memo, metaDataRecord, libraryPath ) {
						if( metaDataRecord.type === type ) {
							memo[ libraryPath ] = metaDataRecord
						}

						return memo
					},
					{}
				)
			},

			setCache : function( content ) {
				_.extend( this.cache.metaData, content )
			},

			isAvailable : function( libraryIds ) {
				var cache = this.cache

				for( var i = 0, n = libraryIds.length, entry; i < n; i++ ) {
					entry = cache.metaData[ createLibraryFilePathFromId( libraryIds[ i ] ) ]

					if( !entry ) return false

					if( entry.file &&
						!cache.resource[ createLibraryFilePath( entry.namespace, entry.file ) ] ) {

						return false
					}
				}

				return true
			},

			free : function() {
				this.cache.resource = {}
			},

			load : function( libraryPaths, config, next ) {
				// TODO: work on a list of assets/libraryRecords and call their getLibraryResourcePaths() methods to determine
				// the required resources instead of a list of libraryPaths
				if( libraryPaths.length === 0 ) {
					throw 'Error: No library paths provided.'
				}

				var id = createLoadingProcessId()

				var loadingProcess = createLoadingProcess(
					id,
					libraryPaths,
					this.baseUrlPrefix,
					config || {},
					next
				)

				this.loadingProcesses[ id ] = loadingProcess

				startLoadingProcess(
					loadingProcess.isMetaDataLoad ? this.cache.metaData : this.cache.resource,
					this.eventManager,
					this.resourceTypeToLoaderFactory,
					this.loadingProcesses,
					loadingProcess
				)

				return id
			}
		}

		return LibraryManager
	}
)

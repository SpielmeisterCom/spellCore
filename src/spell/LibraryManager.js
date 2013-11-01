define(
	'spell/LibraryManager',
	[
		'spell/client/loading/addNamespaceAndName',
		'spell/shared/util/createIdFromLibraryFilePath',
		'spell/shared/util/createLibraryFilePath',
		'spell/shared/util/createLibraryFilePathFromId',
		'spell/shared/util/createUrlWithCacheBreaker',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		addNamespaceAndName,
		createIdFromLibraryFilePath,
		createLibraryFilePath,
		createLibraryFilePathFromId,
		createUrlWithCacheBreaker,
		PlatformKit,

		_
	) {
		'use strict'


		var nextLoadingProcessId = 0

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

		var createLoadingProcess = function( id, libraryPaths, libraryUrl, invalidateCache, config, next ) {
			return {
				assetManager       : config.assetManager,
				id                 : id,
				libraryPaths       : libraryPaths,
				invalidateCache    : invalidateCache,
				numCompleted       : 0,
				name               : config.name,
				next               : next,
				type               : config.type ? config.type : 'auto',
				libraryUrl         : libraryUrl,
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
				[ eventManager.EVENT.RESOURCE_PROGRESS, name ],
				[ progress, loadingProcess.numCompleted, numLibraryPaths ]
			)

			if( loadingProcess.numCompleted === numLibraryPaths ) {
				var loadedLibraryRecords = _.reduce(
					libraryPaths,
					function( memo, value ) {
						var key = _.isObject( value ) ?
							createIdFromLibraryFilePath( value.libraryPath ) :
							createIdFromLibraryFilePath( value )

						memo[ key ] = cache[ key ]

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
						[ eventManager.EVENT.RESOURCE_LOADING_COMPLETED, name ],
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

			cache[ createIdFromLibraryFilePath( libraryPath ) ] = loadedResource

			updateProgress( eventManager, cache, loadingProcesses, loadingProcess )
		}

		var onErrorCallback = function( eventManager, cache, loadingProcesses, loadingProcess, resourceName ) {
			throw 'Error: Loading resource "' + resourceName + '" failed.'
		}

		var onTimedOutCallback = function( eventManager, cache, loadingProcesses, loadingProcess, resourceName ) {
			throw 'Error: Loading resource "' + resourceName + '" timed out.'
		}

		var startLoadingProcess = function( cache, eventManager, resourceTypeToLoaderFactory, loadingProcesses, loadingProcess ) {
			var omitCache       = loadingProcess.omitCache,
				libraryPaths    = loadingProcess.libraryPaths

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
					var cachedEntry = cache[ createIdFromLibraryFilePath( libraryPath ) ]

					if( cachedEntry ) {
						onLoadCallback( eventManager, cache, loadingProcesses, loadingProcess, libraryPath, cachedEntry )

						continue
					}
				}

				var loaderFactory = getLoaderFactory( resourceTypeToLoaderFactory, loadingProcess.type, libraryPath )

				if( !loaderFactory ) {
					throw 'Error: Unable to load resource of type "' + loadingProcess.type + '".'
				}

				var url = loadingProcess.libraryUrl ?
					loadingProcess.libraryUrl + '/' + libraryPathUrlUsedForLoading :
					libraryPathUrlUsedForLoading

				var loader = loaderFactory(
					loadingProcess.assetManager,
					createIdFromLibraryFilePath( libraryPath ),
					loadingProcess.invalidateCache ? createUrlWithCacheBreaker( url ) : url,
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


		var LibraryManager = function( eventManager, libraryUrl, isModeDeployed ) {
			this.eventManager                = eventManager
			this.loadingProcesses            = {}
			this.libraryUrl                  = libraryUrl
			this.invalidateCache             = !isModeDeployed
			this.resourceTypeToLoaderFactory

			this.cache = {
				metaData : {},
				resource : {}
			}
		}

		LibraryManager.prototype = {
			get : function( libraryId ) {
				var cache = this.cache

				return cache.metaData[ libraryId ] || cache.resource[ libraryId ]
			},

			getMetaData : function( libraryId ) {
				return this.cache.metaData[ libraryId ]
			},

			getResource : function( libraryId ) {
				return this.cache.resource[ libraryId ]
			},

			getMetaDataRecordsByType : function( type ) {
				return _.reduce(
					this.cache.metaData,
					function( memo, metaDataRecord, libraryId ) {
						if( metaDataRecord.type === type ) {
							memo[ libraryId ] = metaDataRecord
						}

						return memo
					},
					{}
				)
			},

			addToCache : function( content ) {
				var tmp = _.reduce(
					content,
					function( memo, key, value ) {
						var extension = value.substr( value.lastIndexOf( '.' ) + 1, value.length ),
							isScript  = extension === 'js'

						memo[ isScript ? value : createIdFromLibraryFilePath( value ) ] = key

						return memo
					},
					{}
				)

				_.extend( this.cache.metaData, tmp )
				addNamespaceAndName( this.cache.metaData )
			},

			isAvailable : function( libraryIds ) {
				var cache = this.cache

				for( var i = 0, n = libraryIds.length, entry; i < n; i++ ) {
					entry = cache.metaData[ libraryIds[ i ] ]

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
				if( !this.resourceTypeToLoaderFactory ) {
					throw 'Error: Library manager is not properly initialized.'
				}

				// TODO: work on a list of assets/libraryRecords and call their getLibraryResourcePaths() methods to determine
				// the required resources instead of a list of libraryPaths
				if( libraryPaths.length === 0 ) {
					throw 'Error: No library paths provided.'
				}

				var id = createLoadingProcessId()

				var loadingProcess = createLoadingProcess(
					id,
					libraryPaths,
					this.libraryUrl,
					this.invalidateCache,
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
			},

			init : function( audioContext, renderingContext ) {
				this.resourceTypeToLoaderFactory = createResourceTypeToLoaderFactory( renderingContext, audioContext )
			}
		}

		return LibraryManager
	}
)

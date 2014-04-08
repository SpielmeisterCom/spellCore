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

		var createLoadingProcess = function( id, libraryIdsToLibraryFilePaths, libraryUrl, invalidateCache, config, next ) {
			return {
				assetManager       : config.assetManager,
				id                 : id,
				libraryFilePaths   : libraryIdsToLibraryFilePaths,
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

			var libraryFilePaths = loadingProcess.libraryFilePaths,
				numLibraryPaths  = _.size( libraryFilePaths ),
				progress         = loadingProcess.numCompleted / numLibraryPaths,
				name             = loadingProcess.name

			eventManager.publish(
				[ eventManager.EVENT.RESOURCE_PROGRESS, name ],
				[ progress, loadingProcess.numCompleted, numLibraryPaths ]
			)

			if( loadingProcess.numCompleted === numLibraryPaths ) {
				var loadedLibraryRecords = _.pick( cache, _.keys( libraryFilePaths ) )

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

		var onLoadCallback = function( eventManager, cache, loadingProcesses, loadingProcess, libraryId, libraryFilePath, err, data ) {
			if( err ) {
				throw err
			}

			cache[ libraryId ] = data

			updateProgress( eventManager, cache, loadingProcesses, loadingProcess )
		}

		var startLoadingProcess = function( cache, eventManager, loadingProcesses, requestManager, loadingProcess ) {
			var omitCache        = loadingProcess.omitCache,
				libraryFilePaths = loadingProcess.libraryFilePaths

			for( var libraryId in libraryFilePaths ) {
				var libraryFilePath = libraryFilePaths[ libraryId ]

				if( !omitCache ) {
					var cachedEntry = cache[ libraryId ]

					if( cachedEntry ) {
						onLoadCallback( eventManager, cache, loadingProcesses, loadingProcess, libraryId, libraryFilePath, null, cachedEntry )

						continue
					}
				}

				var url = loadingProcess.libraryUrl ?
					loadingProcess.libraryUrl + '/' + libraryFilePath :
					libraryFilePath

				requestManager.get(
					loadingProcess.invalidateCache ? createUrlWithCacheBreaker( url ) : url,
					_.bind( onLoadCallback, null, eventManager, cache, loadingProcesses, loadingProcess, libraryId, libraryFilePath )
				)
			}
		}


		var LibraryManager = function( eventManager, libraryUrl, isModeDeployed ) {
			this.eventManager                = eventManager
			this.loadingProcesses            = {}
			this.libraryUrl                  = libraryUrl
			this.invalidateCache             = !isModeDeployed

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

				for( var i = 0, entry, libraryId, n = libraryIds.length; i < n; i++ ) {
					libraryId = libraryIds[ i ]
					entry = cache.metaData[ libraryId ]

					if( !entry ||
						( entry.file && !cache.resource[ libraryId ] ) ) {

						return false
					}
				}

				return true
			},

			free : function() {
				this.cache.resource = {}
			},

			load : function( libraryIdsToLibraryFilePaths, config, next ) {
				if( _.size( libraryIdsToLibraryFilePaths ) === 0 ) {
					throw 'Error: No library file paths provided.'
				}

				var id = createLoadingProcessId()

				var loadingProcess = createLoadingProcess(
					id,
					libraryIdsToLibraryFilePaths,
					this.libraryUrl,
					this.invalidateCache,
					config || {},
					next
				)

				this.loadingProcesses[ id ] = loadingProcess

				startLoadingProcess(
					loadingProcess.isMetaDataLoad ? this.cache.metaData : this.cache.resource,
					this.eventManager,
					this.loadingProcesses,
					this.requestManager,
					loadingProcess
				)

				return id
			},

			init : function( requestManager ) {
				this.requestManager                 = requestManager
			}
		}

		return LibraryManager
	}
)

define(
	'spell/LibraryManager',
	[
		'spell/client/loading/addNamespaceAndName',
		'spell/data/LibraryId',
		'spell/data/libraryRecord/Animation',
		'spell/data/libraryRecord/Appearance',
		'spell/data/libraryRecord/Component',
		'spell/data/libraryRecord/EntityTemplate',
		'spell/data/libraryRecord/Font',
		'spell/data/libraryRecord/KeyFrameAnimation',
		'spell/data/libraryRecord/Scene',
		'spell/data/libraryRecord/Script',
		'spell/data/libraryRecord/Sound',
		'spell/data/libraryRecord/SpriteSheet',
		'spell/data/libraryRecord/System',
		'spell/data/libraryRecord/Translation',
		'spell/shared/Promise',
		'spell/shared/util/arrayAppend',
		'spell/shared/util/createIdFromLibraryFilePath',
		'spell/shared/util/createLibraryFilePath',
		'spell/shared/util/createLibraryFilePathFromId',
		'spell/shared/util/createMetaDataFilePathFromId',
		'spell/shared/util/createUrlWithCacheBreaker',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		addNamespaceAndName,
		LibraryId,
		Animation,
		Appearance,
		Component,
		EntityTemplate,
		Font,
		KeyFrameAnimation,
		Scene,
		Script,
		Sound,
		SpriteSheet,
		System,
		Translation,
		Promise,
		arrayAppend,
		createIdFromLibraryFilePath,
		createLibraryFilePath,
		createLibraryFilePathFromId,
		createMetaDataFilePathFromId,
		createUrlWithCacheBreaker,
		PlatformKit,

		_
	) {
		'use strict'


		var LIBRARY_RECORD_TYPE_BY_TYPE_ID = {
			animation         : Animation,
			appearance        : Appearance,
			component         : Component,
			entityTemplate    : EntityTemplate,
			font              : Font,
			keyFrameAnimation : KeyFrameAnimation,
			scene             : Scene,
			script            : Script,
			sound             : Sound,
			spriteSheet       : SpriteSheet,
			system            : System,
			translation       : Translation
		}

		var getLibraryRecordType = function( metaData ) {
			var libraryRecordTypeId = metaData.subtype ? metaData.subtype : metaData.type,
				libraryRecordType   = LIBRARY_RECORD_TYPE_BY_TYPE_ID[ libraryRecordTypeId ]

			if( !libraryRecordType ) {
				throw 'Library record type "' + libraryRecordTypeId + '" is not supported.'
			}

			return libraryRecordType
		}

		var resourceJsonDecoder = function( resource ) {
			return PlatformKit.jsonCoder.decode( resource )
		}

		var createText = _.bind( PlatformKit.createTextLoader, null, resourceJsonDecoder )

		var nextLoadingProcessId = 0

		var createLoadingProcessId = function() {
			return nextLoadingProcessId++
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

		var getLoaderFactory = function( resourceTypeToLoaderFactory, libraryFilePath ) {
			var type          = _.last( libraryFilePath.split( '.' ) ),
				loaderFactory = resourceTypeToLoaderFactory[ type ]

			if( !loaderFactory ) {
				throw 'Could not find loader factory for type "' + type + '".'
			}

			return loaderFactory
		}

		var createLoadingProcess = function( id, libraryIdsToLibraryFilePaths, libraryUrl, invalidateBrowserCache, config, next ) {
			return {
				assetManager       : config.assetManager,
				id                 : id,
				libraryFilePaths   : libraryIdsToLibraryFilePaths,
				invalidateBrowserCache    : invalidateBrowserCache,
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

		var onLoadCallback = function( cache, libraryId, libraryFilePath, result ) {
			if( !result ) {
				throw 'Error: Loading library file "' + libraryFilePath + '" returned a false value.'
			}
		}

		var onErrorCallback = function( libraryId, libraryFilePath ) {
			throw 'Error: Loading library file "' + libraryFilePath + '" failed.'
		}

		var onTimedOutCallback = function( libraryId, libraryFilePath ) {
			throw 'Error: Loading library file "' + libraryFilePath + '" timed out.'
		}

		var startLoadingProcess = function( cache, eventManager, resourceTypeToLoaderFactory, loadingProcesses, loadingProcess ) {
			var omitCache        = loadingProcess.omitCache,
				libraryFilePaths = loadingProcess.libraryFilePaths

			for( var libraryId in libraryFilePaths ) {
				var libraryFilePath = libraryFilePaths[ libraryId ]

				if( !omitCache ) {
					var cachedEntry = cache[ libraryId ]

					if( cachedEntry ) {
						onLoadCallback( eventManager, cache, loadingProcesses, loadingProcess, libraryId, libraryFilePath, cachedEntry )

						continue
					}
				}

				var loaderFactory = getLoaderFactory( resourceTypeToLoaderFactory, loadingProcess.type, libraryFilePath )

				if( !loaderFactory ) {
					throw 'Error: Unable to load resource of type "' + loadingProcess.type + '".'
				}

				var url = loadingProcess.libraryUrl ?
					loadingProcess.libraryUrl + '/' + libraryFilePath :
					libraryFilePath

				var loader = loaderFactory(
					loadingProcess.assetManager,
					libraryId,
					loadingProcess.invalidateBrowserCache ? createUrlWithCacheBreaker( url ) : url,
					_.bind( onLoadCallback, null, eventManager, cache, loadingProcesses, loadingProcess, libraryId, libraryFilePath ),
					_.bind( onErrorCallback, null, eventManager, cache, loadingProcesses, loadingProcess, libraryId, libraryFilePath ),
					_.bind( onTimedOutCallback, null, eventManager, cache, loadingProcesses, loadingProcess, libraryId, libraryFilePath )
				)

				if( !loader ) {
					throw 'Could not create a loader for resource "' + libraryFilePath + '".'
				}

				loader.start()
			}
		}

		var createUrl = function( libraryUrl, invalidateBrowserCache, libraryFilePath ) {
			var url = libraryUrl ?
				libraryUrl + '/' + libraryFilePath :
				libraryFilePath

			return invalidateBrowserCache ? createUrlWithCacheBreaker( url ) : url
		}

		var loadMetaData = function( spell, metaDataCache, invalidateBrowserCache, alreadyLoadedLibraryIds, libraryUrl, libraryId ) {
			var promise                     = new Promise(),
				resourceFilePathToLibraryId = {}

			var libraryFilePath = createMetaDataFilePathFromId( libraryId )

			// Skip loading the meta data record for the libraryId if it has already been loaded during this pass.
			if( _.contains( alreadyLoadedLibraryIds, libraryId ) ) {
				console.log( '>>> already loaded: "' + libraryId + '"' )

				promise.done( null, resourceFilePathToLibraryId )

				return promise
			}

			alreadyLoadedLibraryIds.push( libraryId )

			var loader = createText(
				createUrl( libraryUrl, invalidateBrowserCache, libraryFilePath ),
				function( metaData ) {
					metaData.id = new LibraryId( libraryId )
					metaDataCache[ libraryId ] = metaData

					// TODO: remove onLoadCallback?
					onLoadCallback( metaDataCache, libraryId, libraryFilePath, metaData )

					var libraryRecordType = getLibraryRecordType( metaData )

					if( libraryRecordType.hasExternalResource( spell, metaData ) ) {
						var resourceFilePaths = libraryRecordType.getExternalResourceFilePaths( spell, metaData )

						for( var i = 0, n = resourceFilePaths.length; i < n; i++ ) {
							resourceFilePathToLibraryId[ resourceFilePaths[ i ] ] = libraryId
						}
					}

					console.log( 'recursing loadMetaData for "' + libraryId + '"' )

					Promise.join(
						_.map(
							libraryRecordType.getDependencies( spell, metaData ),
							_.bind( loadMetaData, null, spell, metaDataCache, invalidateBrowserCache, alreadyLoadedLibraryIds, libraryUrl )
						)

					).then( function( dependencyResults ) {
						promise.done(
							null,
							_.reduce(
								dependencyResults,
								function( memo, results ) {
									return _.extend( memo, results[ 1 ] )
								},
								resourceFilePathToLibraryId
							)
						)
					} )
				},
				_.bind( onErrorCallback, null, libraryId, libraryFilePath ),
				_.bind( onTimedOutCallback, null, libraryId, libraryFilePath )
			)

			loader.start()

			return promise
		}

		var loadResource = function( spell, metaDataCache, resourceCache, resourceTypeToLoaderFactory, invalidateBrowserCache, libraryUrl, libraryId, libraryFilePath ) {
			var promise           = new Promise()//,
//				metaData          = metaDataCache[ libraryId ],
//				libraryRecordType = getLibraryRecordType( metaData )

			var loaderFactory = getLoaderFactory( resourceTypeToLoaderFactory, libraryFilePath )

			var loader = loaderFactory(
				spell.assetManager,
				libraryId,
				createUrl( libraryUrl, invalidateBrowserCache, libraryFilePath ),
				function( resource ) {
					resourceCache[ libraryFilePath ] = resource

					promise.done()
				},
				_.bind( onErrorCallback, null, libraryId, libraryFilePath ),
				_.bind( onTimedOutCallback, null, libraryId, libraryFilePath )
			)

			loader.start()

			return promise
		}

		var startMetaDataPass = function( spell, metaDataCache, libraryUrl, libraryId ) {
			var invalidateBrowserCache  = false,
				alreadyLoadedLibraryIds = []

			return loadMetaData( spell, metaDataCache, invalidateBrowserCache, alreadyLoadedLibraryIds, libraryUrl, libraryId )
		}

		var startResourcePass = function( spell, metaDataCache, resourceCache, resourceTypeToLoaderFactory, libraryUrl, resourceFilePathToLibraryId ) {
			var promise                = new Promise(),
				invalidateBrowserCache = false

			Promise.join(
				_.map(
					resourceFilePathToLibraryId,
					_.bind( loadResource, null, spell, metaDataCache, resourceCache, resourceTypeToLoaderFactory, invalidateBrowserCache, libraryUrl )
				)

			).then( function( results ) {
				promise.done()
			} )

			return promise
		}


		var LibraryManager = function( spell, eventManager, libraryUrl, isModeDeployed ) {
			this.spell                       = spell
			this.eventManager                = eventManager
			this.loadingProcesses            = {}
			this.libraryUrl                  = isModeDeployed ? '' : '../' + libraryUrl
			this.invalidateBrowserCache      = !isModeDeployed
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

				// TODO: new LibraryId statt addNamespaceAndName verwenden
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

//			load : function( libraryIdsToLibraryFilePaths, config, next ) {
//				if( !this.resourceTypeToLoaderFactory ) {
//					throw 'Error: Library manager is not properly initialized.'
//				}
//
//				if( _.size( libraryIdsToLibraryFilePaths ) === 0 ) {
//					throw 'Error: No library file paths provided.'
//				}
//
//				var id = createLoadingProcessId()
//
//				var loadingProcess = createLoadingProcess(
//					id,
//					libraryIdsToLibraryFilePaths,
//					this.libraryUrl,
//					this.invalidateBrowserCache,
//					config || {},
//					next
//				)
//
//				this.loadingProcesses[ id ] = loadingProcess
//
//				startLoadingProcess(
//					loadingProcess.isMetaDataLoad ? this.cache.metaData : this.cache.resource,
//					this.eventManager,
//					this.resourceTypeToLoaderFactory,
//					this.loadingProcesses,
//					loadingProcess
//				)
//
//				return id
//			},

			load : function( libraryId, next ) {
				// TODO: in the first pass perform loading of all dependent library meta data records
				var spell                       = this.spell,
					metaDataCache               = this.cache.metaData,
					resourceCache               = this.cache.resource,
					resourceTypeToLoaderFactory = this.resourceTypeToLoaderFactory,
					libraryUrl                  = this.libraryUrl

				startMetaDataPass(
					spell,
					metaDataCache,
					libraryUrl,
					libraryId

				).then(
					function( error, libraryIdToResourceFilePath ) {
						if( error ) {
							throw error
						}

						return startResourcePass(
							spell,
							metaDataCache,
							resourceCache,
							resourceTypeToLoaderFactory,
							libraryUrl,
							libraryIdToResourceFilePath
						)
					}

				).then(
					function( error ) {
						next()
					}
				)
			},

			init : function( audioContext, renderingContext ) {
				this.resourceTypeToLoaderFactory = createResourceTypeToLoaderFactory( renderingContext, audioContext )
			}
		}

		return LibraryManager
	}
)

define(
	'spell/LibraryManager',
	[
		'spell/client/loading/addNamespaceAndName',
		'spell/library/getDependencies',
		'spell/shared/util/platform/Types',

		'ff',
		'spell/functions'
	],
	function(
		addNamespaceAndName,
		getDependencies,
		Types,
		ff,
		_
	) {
		'use strict'


		var LibraryManager = function( requestManager ) {
            this.requestManager              = requestManager
			this.library                     = {}
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


			/**
			 * This function loads library records which are specified by their libraryId(s). Dependencies are automatically resolved and loaded
			 * The result of the loading operation will be passed into the callback function
			 *
			 * @param libraryIds - One or multiple libraryIds to load
			 * @param callback - Callback in the form of fn( err, data )
			 * @param libraryBaseUrl - base URL of the library. Ends with an /, defaults to: library/
			 * @param forceReload - Specifiy whether a cache breaker should be added to the requests in order to avoid the local browser cache
			 * @param timeoutInMs - Timeout in ms after which the loading operation fails
			 */
			loadRecords : function( libraryIds, callback, libraryBaseUrl, forceReload, timeoutInMs ) {
				if( !libraryBaseUrl ) {
					libraryBaseUrl = 'library/'
				}

				if( !timeoutInMs ) {
					timeoutInMs = 300000
				}

				if( !_.isArray( libraryIds )) {
					libraryIds = [ libraryIds ]
				}

				var f = ff( this )
				f.timeout( timeoutInMs )

				// load libraryIds
				f.next(
					function() {
						for( var index in libraryIds ) {
							var libraryId   = libraryIds[ index ],
								url         = libraryBaseUrl + libraryId.replace( /\./g, '/' ) + '.json'

							// add a browser cache breaker if we're force reloading
							if( forceReload ) {
								url += '?t=' + Types.Time.getCurrentInMs()
							}

							var cb = f.slot()

							this.requestManager.get( url, function( err, data ) {
								//wrap the libraryId into the result object
								if( data ) {
									cb( err, {
										libraryId:  libraryId,
										data:       data
									} )

								} else {

									cb( err, null )
								}
							} )
						}
					}
				)

				// process results and trigger loading for all dependencies
				f.next(
					function( ) {
						var result = {}

						for( var i=0; i<arguments.length; i++) {

							var argumentsIterator   = arguments[ i ],
								libraryId           = argumentsIterator.libraryId,
								dependencies        = getDependencies( argumentsIterator.data )

							result[ libraryId ] = argumentsIterator.data

							if( dependencies.length > 0 ) {
								this.loadRecords(
									dependencies,
									f.slot(),
									forceReload
								)
							}
						}

						f.pass( result )
					}
				)

				// merge results
				f.next(
					function() {
						var result = {}
						for( var i=0; i<arguments.length; i++) {
							var result = _.extend( result, arguments[ i ] )
						}

						f.succeed( result )
					}
				)

				f.onComplete( callback )
			}
		}

		return LibraryManager
	}
)

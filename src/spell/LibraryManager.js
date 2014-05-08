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

		var loadLibraryRecordsRecursive = function( library, requestManager, libraryIds, callback, libraryBaseUrl, forceReload, timeoutInMs ) {
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

						if( !forceReload && library[ libraryId ] ) {
							//library record already exists, so use the cached version
							f.pass( {
								libraryId:  libraryId,
								data:       library[ libraryId ]
							} )

						} else {

							var cb = f.slot()

							requestManager.get( url, function( err, data ) {
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
				}
			)

			// process results and trigger loading for all dependencies
			f.next(
				function( ) {
					for( var i=0; i<arguments.length; i++) {

						var argumentsIterator   = arguments[ i ],
							libraryId           = argumentsIterator.libraryId,
							dependencies        = getDependencies( argumentsIterator.data )

						library[ libraryId ] = argumentsIterator.data

						if( dependencies.length > 0 ) {
							loadLibraryRecordsRecursive(
								library,
								requestManager,
								dependencies,
								f.slot(),
								forceReload
							)
						}
					}

					f.pass( library )
				}
			)

			// merge results
			f.next(
				function() {
					var result = {}
					for( var i=0; i<arguments.length; i++) {
						library = _.extend( library, arguments[ i ] )

					}

					f.succeed( library )
				}
			)

			f.onComplete( callback )
		}

		LibraryManager.prototype = {
	/*

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


			free : function() {
				this.cache.resource = {}
			},
*/


			get : function( libraryId, forceType ) {
				var libraryEntry = this.library[ libraryId ]


				if( !libraryEntry || !libraryEntry.type ||
					( forceType && libraryEntry.type != forceType )) {
					return
				}

				return libraryEntry
			},

			addToLibrary : function( ) {

			},

			/**
			 * This function loads library records which are specified by their libraryId(s). Dependencies are automatically resolved and loaded
			 * The result of the loading operation will be added to the local library cache
			 *
			 * This function shouldn't be called directly. Use loadLibraryRecords instead.
			 *
			 * The local library cache will be passed into the callback function as data object as soon as the loading is finished
			 *
			 * @param libraryIds - One or multiple libraryIds to load
			 * @param callback - Callback in the form of fn( err, data )
			 * @param libraryBaseUrl - base URL of the library. Ends with an /, defaults to: library/
			 * @param forceReload - Specifiy whether a cache breaker should be added to the requests in order to avoid the local browser cache
			 * @param timeoutInMs - Timeout in ms after which the loading operation fails
			 */
			loadLibraryRecords: function( libraryIds, callback, libraryBaseUrl, forceReload, timeoutInMs ) {
				loadLibraryRecordsRecursive(
					{},
					this.requestManager,
					libraryIds,
					callback,
					libraryBaseUrl,
					forceReload,
					timeoutInMs
				)
			},

			/**
			 * Resets the library cache
			 */
			free : function() {
				this.library = {}
			}
		}

		return LibraryManager
	}
)

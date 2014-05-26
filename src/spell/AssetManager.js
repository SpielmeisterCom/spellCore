/**
 * @class spell.assetManager
 * @singleton
 */
define(
	'spell/AssetManager',
	function() {
		'use strict'


		var AssetManager = function( libraryManager ) {
			this.assets         = {},
			this.libraryManager = libraryManager
		}

		AssetManager.prototype = {
			loadAssets: function( library, assetIds, callback, libraryBaseUrl, forceReload, timeoutInMs ) {

			},

				/**
			 * Adds an asset.
			 *
			 * @param {String} id
			 * @param {String} asset
			 */
			add : function( id, asset ) {
				this.assets[ id ] = asset
			},

			/**
			 * Gets an asset by id.
			 *
			 * @param {String} id
			 * @return {Object}
			 */
			get : function( id ) {
				return this.assets[ id ]
			},

			/**
			 * Returns true if an asset with the specified id exists.
			 *
			 * @param {String} id
			 * @return {Boolean}
			 */
			has : function( id ) {
				return !!this.assets[ id ]
			},

			/**
			 * Returns the library ids of all assets which reference a specific resource id.
			 *
			 * @private
			 * @param {String} resourceId
			 * @return {Array}
			 */
			getLibraryIdByResourceId : function( resourceId ) {
				var assets = this.assets,
					ids = []

				for( var id in assets ) {
					var asset = assets[ id ]

					if( asset.resourceId &&
						asset.resourceId === resourceId ) {

						ids.push( id.slice( id.indexOf( ':' ) + 1 ) )
					}
				}

				return ids
			},

			/**
			 * Inject the provided resources into asset instances where applicable.
			 *
			 * @private
			 * @param {Object} resources
			 */
			injectResources : function( resources ) {
				if( !resources ) return

				var assets         = this.assets,
					libraryManager = this.libraryManager

				for( var id in assets ) {
					var asset     = assets[ id ],
						libraryId = asset.resourceId || id.substr( id.indexOf( ':' ) + 1, id.length )

					if( !resources[ libraryId ] ) {
						continue
					}

					var resource = libraryManager.getResource( libraryId ) || libraryManager.getMetaData( libraryId )

					if( resource ) {
						asset.resource = resource
					}
				}
			},

			/**
			 * Frees all asset instances.
			 *
			 * @private
			 */
			free : function() {
				this.assets = {}
			}
		}

		return AssetManager
	}
)

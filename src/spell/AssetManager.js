define(
	'spell/AssetManager',
	function() {
		'use strict'


		var AssetManager = function( libraryManager ) {
			this.assets         = {},
			this.libraryManager = libraryManager
		}

		AssetManager.prototype = {
			add : function( id, asset ) {
				this.assets[ id ] = asset
			},
			get : function( id ) {
				return this.assets[ id ]
			},
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
			has : function( id ) {
				return !!this.assets[ id ]
			},
			injectResources : function( resources ) {
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
			free : function() {
				this.assets = {}
			}
		}

		return AssetManager
	}
)

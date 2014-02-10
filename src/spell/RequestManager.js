/**
 * This class handles all external request handling
 *
 * @class spell.RequestManager
 * @singleton
 */
define(
	'spell/RequestManager',
	[
		'spell/functions',
		'spell/shared/util/platform/PlatformKit'
	],
	function(
		_,
	    PlatformKit
	) {
		'use strict'

		var Loader = function( imageLoader, soundLoader, textLoader ) {

			this.resourceTypeLoadFunctions = {
				jpeg    : _.bind( imageLoader.load, imageLoader ),
				jpg     : _.bind( imageLoader.load, imageLoader ),
				png     : _.bind( imageLoader.load, imageLoader ),

				music   : _.bind( soundLoader.load, soundLoader, true ),
				sfx     : _.bind( soundLoader.load, soundLoader, false ),
				mp3     : _.bind( soundLoader.load, soundLoader, false ),
				wav     : _.bind( soundLoader.load, soundLoader, false ),
				ogg     : _.bind( soundLoader.load, soundLoader, false ),


				json    : function( url, callback ) {
					// automtically decode json files
					textLoader.load( url, function( err, data ) {
						if(!err)
						{
							try {
								data = PlatformKit.jsonCoder.decode( data )

							} catch ( e ) {
								err = "Loader> Could not load " + url + " : " + e.message
								data = null
							}
						}

						callback( err, data )
					} )

				},
				txt     : function( url, callback ) { textLoader.load( url, callback, false ) }
			}
		}

		Loader.prototype = {
			/**
			 *
			 * @param url
			 * @param callback
			 * @param forceType
			 */
			get : function( url, callback, forceType ) {
				var type

				if( forceType ) {
					if( !this.resourceTypeLoadFunctions[ forceType ] ) {
						throw 'Unknown forceType. Valid types are ' + _.keys( this.resourceTypeLoadFunctions )
					}

					type = forceType

				} else {
					var type = _.last( url.split( '.' ) )

					if( !this.resourceTypeLoadFunctions[ type ] ) {
						type = 'txt'
					}
				}

				var loadFn = this.resourceTypeLoadFunctions[ type ]

				loadFn( url, callback )
			}
		}

		return Loader
	}
)

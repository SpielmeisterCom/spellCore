define(
	"spell/shared/util/platform/private/loader/SoundLoader",
	[
		"spell/shared/util/platform/private/loader/TextLoader",
		"spell/shared/util/Events",
		"spell/shared/util/platform/private/sound/loadSounds",
		"spell/shared/util/platform/private/registerTimer",

		'spell/functions'
	],
	function(
		TextLoader,
		Events,
		loadSounds,
		registerTimer,

		_
	) {
		"use strict"


		/*
		 * private
		 */

		var processSoundSpriteConfig = function( soundSpriteConfig, onCompleteCallback ) {
			if( !_.has( soundSpriteConfig, "type" ) ||
				soundSpriteConfig.type !== 'spriteConfig' ||
				!_.has( soundSpriteConfig, "music" ) ||
				!_.has( soundSpriteConfig, "fx" ) ) {

				throw 'Not a valid sound sprite configuration.'
			}

			var loadingCompleted = false
			var timeOutLength = 5000

			// if loadSounds does not return in under 5000 ms a failed load is assumed
			registerTimer(
				_.bind(
					function() {
						if( loadingCompleted ) return

						this.onTimeOut( this.resourceBundleName, this.resourceUri )
					},
					this
				),
				timeOutLength
			)

			// creating the spell sound objects out of the sound sprite config
			loadSounds(
                this.soundManager,
				soundSpriteConfig,
				function( sounds ) {
					if( loadingCompleted ) return

					onCompleteCallback( sounds )
					loadingCompleted = true
				}
			)
		}

		var loadJson = function( uri, onCompleteCallback ) {
			var textLoader = new TextLoader(
				this.eventManager,
				this.host,
				this.resourceBundleName,
				uri,
				function( jsonString ) {
					var object = JSON.parse( jsonString )

					if( object === undefined ) throw 'Parsing json string failed.'


					onCompleteCallback( object )
				}
			)

			textLoader.start()
		}


		/*
		 * public
		 */

		var SoundLoader = function( host, resourceUri, onLoadCallback, onErrorCallback ) {
			this.host            = host
			this.resourceUri     = resourceUri
			this.onLoadCallback  = onLoadCallback
			this.onErrorCallback = onErrorCallback
		}

		SoundLoader.prototype = {
			start: function() {
				var fileName = _.last( this.resourceUri.split( '/' ) )
				var extension = _.last( fileName.split( '.' ) )

				if( extension === "json" ) {
					/*
					 * The html5 back-end uses sound sprites by default. Therefore loading of the sound set config can be skipped and the sound sprite config
					 * can be loaded directly.
					 */
					var soundSpriteConfigUri = "sounds/output/" + fileName

					loadJson.call(
						this,
						soundSpriteConfigUri,
						_.bind(
							function( soundSpriteConfig ) {
								processSoundSpriteConfig.call( this, soundSpriteConfig, this.onCompleteCallback )
							},
							this
						)
					)

				} else /*if( extension === "" )*/ {
//					console.log( "Not yet implemented." )
				}
			}
		}

		return SoundLoader
	}
)

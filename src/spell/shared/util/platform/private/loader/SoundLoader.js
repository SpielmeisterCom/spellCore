define(
	"spell/shared/util/platform/private/loader/SoundLoader",
	[
		"spell/shared/util/platform/private/sound/SoundManager",
		"spell/shared/util/Events",

		'spell/functions'
	],
	function(
		SoundManager,
		Events,

		_
		) {
		"use strict"

		/*
		 * private
		 */

		var onLoad = function( sound ) {
			if( this.loaded === true ) return
			this.loaded = true
			this.onLoadCallback( sound )
		}

		/*
		 * public
		 */

		var SoundLoader = function( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			this.resourcePath       = resourcePath
			this.resourceName       = resourceName
			this.onLoadCallback     = onLoadCallback
			this.onErrorCallback    = onErrorCallback
			this.loaded             = false
		}

		SoundLoader.prototype = {
			start: function() {
				var src          = this.resourcePath + '/' + this.resourceName,
					soundManager = new SoundManager()
				//TODO: refactor soundmanager
				soundManager.createAudio({
					id: src,
					resource: src,
					onloadeddata: _.bind( onLoad, this)
				})

			}
		}

		return SoundLoader
	}
)

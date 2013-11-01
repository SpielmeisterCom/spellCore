define(
	'spell/shared/util/platform/private/loader/SoundLoader',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var onLoad = function( buffer ) {
			if( this.loaded === true ) return
			this.loaded = true

			// TODO: free SoundLoader retained js objects

			this.onLoadCallback( this.audioContext.createSound( buffer ) )
		}


		var SoundLoader = function( audioContext, asset, url, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			this.audioContext    = audioContext
			this.asset           = asset
			this.url             = url
			this.onLoadCallback  = onLoadCallback
			this.onErrorCallback = onErrorCallback
			this.loaded          = false
		}

		SoundLoader.prototype = {
			start : function() {
				this.audioContext.loadBuffer(
					this.url,
					this.asset,
					_.bind( onLoad, this )
				)
			}
		}

		return SoundLoader
	}
)

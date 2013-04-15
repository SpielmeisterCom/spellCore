define(
	'spell/shared/util/platform/private/loader/SoundLoader',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'

		/*
		 * private
		 */

		var onLoad = function( buffer ) {
			if( this.loaded === true ) return
			this.loaded = true

			// TODO: free SoundLoader retained js objects

			this.onLoadCallback( this.audioContext.createSound( buffer ) )
		}

		/*
		 * public
		 */

		var SoundLoader = function( audioContext, libraryUrl, libraryPath, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			this.audioContext    = audioContext
			this.libraryUrl      = libraryUrl
			this.libraryPath     = libraryPath
			this.onLoadCallback  = onLoadCallback
			this.onErrorCallback = onErrorCallback
			this.loaded          = false
		}

		SoundLoader.prototype = {
			start : function() {
				this.audioContext.loadBuffer(
					this.libraryUrl ? this.libraryUrl + '/' + this.libraryPath : this.libraryPath,
					_.bind( onLoad, this )
				)
			}
		}

		return SoundLoader
	}
)

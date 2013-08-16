define(
	'spell/shared/util/platform/private/loader/SoundLoader',
	[
		'spell/shared/util/createUrlWithCacheBreaker',

		'spell/functions'
	],
	function(
		createUrlWithCacheBreaker,

		_
	) {
		'use strict'


		var onLoad = function( buffer ) {
			if( this.loaded === true ) return
			this.loaded = true

			// TODO: free SoundLoader retained js objects

			this.onLoadCallback( this.audioContext.createSound( buffer ) )
		}


		var SoundLoader = function( audioContext, invalidateCache, libraryUrl, libraryPath, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			this.audioContext    = audioContext
			this.invalidateCache = invalidateCache
			this.libraryUrl      = libraryUrl
			this.libraryPath     = libraryPath
			this.onLoadCallback  = onLoadCallback
			this.onErrorCallback = onErrorCallback
			this.loaded          = false
		}

		SoundLoader.prototype = {
			start : function() {
				var url = this.libraryUrl ?
					this.libraryUrl + '/' + this.libraryPath :
					this.libraryPath

				this.audioContext.loadBuffer(
					this.invalidateCache ? createUrlWithCacheBreaker( url ) : url,
					_.bind( onLoad, this )
				)
			}
		}

		return SoundLoader
	}
)

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

		var SoundLoader = function( audioContext, resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			this.audioContext    = audioContext
			this.resourcePath    = resourcePath
			this.resourceName    = resourceName
			this.onLoadCallback  = onLoadCallback
			this.onErrorCallback = onErrorCallback
			this.loaded          = false
		}

		SoundLoader.prototype = {
			start : function() {
				this.audioContext.loadBuffer(
					this.resourcePath + '/' + this.resourceName,
					_.bind( onLoad, this )
				)
			}
		}

		return SoundLoader
	}
)

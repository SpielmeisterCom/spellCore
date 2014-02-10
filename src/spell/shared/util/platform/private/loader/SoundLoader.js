define(
	'spell/shared/util/platform/private/loader/SoundLoader',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var onLoad = function( callback, buffer ) {
			// TODO: free SoundLoader retained js objects

			callback(
				null,
				this.audioContext.createSound( buffer )
			)
		}


		var SoundLoader = function( audioContext ) {
			this.audioContext    = audioContext
		}

		SoundLoader.prototype = {
			load : function( url, isMusic, callback ) {

				this.audioContext.loadBuffer(
					url,
					isMusic,
					_.bind( onLoad, this, callback )
				)
			}
		}

		return SoundLoader
	}
)

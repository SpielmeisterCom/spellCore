define(
	'spell/shared/util/platform/private/sound/dummyAudio/createDummyAudioContext',
	function() {
		'use strict'


		var isMutedValue = false

		var dummy = function() {}

		var setAllMuted = function( isMute ) {
			isMutedValue = isMute
		}

		var isAllMuted = function() {
			return isMutedValue
		}

		var createSound = function( buffer ) {
			return {}
		}

		var loadBuffer = function( src, onLoadCallback ) {
			if( !src ) {
				throw 'Error: No src provided.'
			}

			if( !onLoadCallback ) {
				throw 'Error: No onLoadCallback provided.'
			}

			onLoadCallback( {} )
		}

		var createWrapperContext = function() {
			return {
				tick             : dummy,
				play             : dummy,
				setLoop          : dummy,
				setVolume        : dummy,
				setAllMuted      : setAllMuted,
				isAllMuted       : isAllMuted,
				stop             : dummy,
				mute             : dummy,
				createSound      : createSound,
				loadBuffer       : loadBuffer,
				getConfiguration : function() { return { type : 'dummy' } }
			}
		}

		/*
		 * Returns an audio context.
		 */
		var createAudioContext = function() {
			return createWrapperContext()
		}

		return createAudioContext
	}
)

define(
	'spell/shared/util/platform/private/sound/dummyAudio/createDummyAudioContext',
	[
		'spell/shared/util/platform/private/sound/createSoundId'
	],
	function(
		createSoundId
	) {
		'use strict'


		var isMutedValue = false

		var dummy = function() {}

		var play = function( soundAsset, volume, loop ) {
			return createSoundId()
		}

		var setAllMuted = function( isMute ) {
			isMutedValue = isMute
		}

		var isAllMuted = function() {
			return isMutedValue
		}

		/*
		 * Returns a SoundResource instance.
		 *
		 * @param buffer
		 * @return {SoundResource}
		 */
		var createSound = function( buffer ) {
			return {}
		}

		var loadBuffer = function( src, soundAsset, onLoadCallback ) {
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
				play             : play,
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
		 *
		 * @return {Object}
		 */
		var createAudioContext = function() {
			return createWrapperContext()
		}

		return createAudioContext
	}
)

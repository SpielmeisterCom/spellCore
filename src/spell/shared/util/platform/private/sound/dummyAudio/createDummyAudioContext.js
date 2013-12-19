define(
	'spell/shared/util/platform/private/sound/dummyAudio/createDummyAudioContext',
	[
		'spell/shared/util/platform/private/sound/createSoundId'
	],
	function(
		createSoundId
	) {
		'use strict'


		var isMutedValue         = false
		var isContextPausedValue = false

		var dummy = function() {}

		var play = function( soundAsset, volume, loop ) {
			return createSoundId()
		}

		var muteContext = function() {
			isMutedValue = true
		}

		var unmuteContext = function() {
			isMutedValue = false
		}

		var isContextMuted = function() {
			return isMutedValue
		}

		var isContextPaused = function() {
			return isContextPausedValue
		}

		var pauseContext = function() {
			isContextPausedValue = true
		}

		var resumeContext = function() {
			isContextPausedValue = false
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
				pause            : dummy,
				resume           : dummy,
				stop             : dummy,
				mute             : dummy,
				unmute           : dummy,
				muteContext      : muteContext,
				unmuteContext    : unmuteContext,
				isContextMuted   : isContextMuted,
				pauseContext     : pauseContext,
				resumeContext    : resumeContext,
				isContextPaused  : isContextPaused,
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

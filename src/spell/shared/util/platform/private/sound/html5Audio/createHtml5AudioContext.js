define(
	'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
	function() {
		'use strict'

		/*
		 * private
		 */
		var audioElements  = {},
			isMutedValue   = false,
			soundIdCounter = 0

		var create = function( id, audioResource ) {
			var audio

			if( audioResource.privateAudioResource.cloneNode ) {
				audio = audioResource.privateAudioResource.cloneNode( true )

			} else {
				audio = new Audio()
				audio.src = audioResource.privateAudioResource.src
			}

			audioElements[ id ] = audio

			return audio
		}

		var loopCallback = function() {
			this.currentTime = 0
			this.play()
		}

		var removeCallback = function() {
			this.removeEventListener( 'ended', removeCallback, false )
			this.removeEventListener( 'ended', loopCallback, false )
		}

		/**
		 *
		 * @param audioResource
		 * @param id
		 * @param volume
		 * @param loop
		 */
		var play = function( audioResource, id, volume, loop ) {
			if( !id ) {
				id = "tmp_sound_" + soundIdCounter++
			}

			var audioElement = audioElements[ id ] || create( id, audioResource )

			setLoop( id, loop )
			setVolume( id, volume )

			if( isMuted() ) {
				mute( id )
			}

			audioElement.play()
		}

		var stopAll = function() {
			for( var id in audioElements ) {
				mute( id )
			}
		}

		var resumeAll = function() {
			for( var id in audioElements ) {
				setVolume( id, 1 )
			}
		}

		var stop = function( id ) {
			var audioElement = audioElements[ id ]
			if( !audioElement ) return

			audioElement.pause()
		}

		var setVolume = function ( id, volume ) {
			volume = !isNaN( volume ) && volume < 1 && volume >= 0 ? volume : 1

			var audioElement = audioElements[ id ]
			if( !audioElement ) return

			audioElement.volume = volume
		}

		var setLoop = function( id, loop ) {
			var audioElement = audioElements[ id ]
			if( !audioElement ) return

			if( loop ) {
				audioElement.addEventListener( 'ended', loopCallback, false )
				audioElement.removeEventListener( 'ended', removeCallback, false )

			} else {
				audioElement.addEventListener( 'ended', removeCallback, false )
				audioElement.removeEventListener( 'ended', loopCallback, false )
			}
		}

		var mute = function( id ) {
			setVolume( id, 0 )
		}

		var setMute = function( isMute ) {
			if( isMute ) {
				stopAll()

			} else {
				resumeAll()
			}

			isMutedValue = isMute
		}

		var isMuted = function() {
			return isMutedValue
		}

		var destroy = function( id ) {
			var audioElement = audioElements[ id ]

			if( !audioElement ) return

			audioElement.removeEventListener( 'ended', removeCallback, false )
			audioElement.removeEventListener( 'ended', loopCallback, false )
			audioElement.pause()

			delete audioElements[ id ]
		}

		/*
		 * Returns a audio context. Once a context has been created additional calls to this method return the same context instance.
		 *
		 * @param sound - the audio element
		 */
		var createAudioContext = function() {
			var context = new Audio()

			if( !context ) return null

			return createWrapperContext()
		}

		var tick = function() {}

		/*
		 * Creates a wrapper context from the backend context.
		 */
		var createWrapperContext = function() {
			return {
				tick        : tick,
				play        : play,
				setLoop     : setLoop,
				setVolume   : setVolume,
				setAllMuted : setMute,
				isAllMuted  : isMuted,
				stop        : stop,
				mute        : mute,
				destroy     : destroy,
				createSound : createSound,
				stopAll     : stopAll,
				resumeAll   : resumeAll
			}
		}

		/*
		 * public
		 */

		/*
		 * Returns instance of audio class
		 *
		 * @param audio
		 */
		var createSound = function( audio ) {
			return {
				/*
				 * Public
				 */
				duration : audio.duration,

				/*
				 * Private
				 *
				 * This is an implementation detail of the class. If you write code that depends on this you better know what you are doing.
				 */
				privateAudioResource : audio
			}
		}

		return createAudioContext
	}
)

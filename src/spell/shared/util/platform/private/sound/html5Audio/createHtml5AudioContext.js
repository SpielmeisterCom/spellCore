define(
	'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
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
		var audioElements = {},
			isMutedValue  = false,
			soundCounter  = 0

		var create = function( id, audioResource ) {
			var audio = audioResource.privateAudioResource.cloneNode(true)

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
			id = ( id ) ? id : "tmp_sound_" + soundCounter++
			var audioElement = ( _.has( audioElements, id ) ) ? audioElements[id] : create( id, audioResource )

			setLoop( id, loop )
			setVolume( id, volume )

			if( isMuted() ) mute( id )

			audioElement.play()
		}

		var stop = function( id ) {
			var audioElement = audioElements[ id ]

			audioElement.pause()
		}

		var setVolume = function ( id, volume ) {
			volume = ( !isNaN(volume) && volume < 1 && volume >= 0 ) ? volume : 1
			var audioElement = audioElements[ id ]

			audioElement.volume = volume
		}

		var setLoop = function( id, loop ) {
			loop = !!loop
			var audioElement = audioElements[ id ]

			if( loop ) {
				audioElement.addEventListener( 'ended', loopCallback, false )
				audioElement.removeEventListener( 'ended', removeCallback, false )
			} else {
				audioElement.removeEventListener( 'ended', loopCallback, false )
				audioElement.addEventListener( 'ended', removeCallback, false )
			}
		}

		var mute = function( id ) {
			setVolume( id, 0 )
		}

		var setMute = function( isMute ) {
			isMutedValue = isMute
		}

		var isMuted = function() {
			return isMutedValue
		}

		var destroy = function( id ) {
			var audioElement = audioElements[ id ]

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

			if( context === null ) return null


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
				createSound : createSound
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

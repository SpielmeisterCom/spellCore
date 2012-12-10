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
			isMutedValue  = false

		var create = function( id, audioResource ) {
			var audio = audioResource.privateAudioResource.cloneNode(true)

			audio.playing  = false
			audioElements[ id ] = audio
			return audio
		}

		var pauseCallback = function () {
			if ( parseFloat( this.currentTime ) >= parseFloat( this.duration ) && this.paused === false) {
				this.playing = false
				this.pause()
			}
		}

		var playingCallback = function() {
			if( this.playing === false ) {
				this.playing = true
				this.addEventListener( 'timeupdate', pauseCallback, false )
			}
		}


		var loopCallback = function() {
			if( this.playing === false ) {
				this.removeEventListener( 'timeupdate', pauseCallback, false )
				this.play()
			}
		}

		var removeCallback = function() {
			this.removeEventListener( 'ended', removeCallback, false )
			this.removeEventListener( 'timeupdate', pauseCallback, false )
			this.removeEventListener( 'pause', removeCallback, false )
			this.removeEventListener( 'playing', playingCallback, false )
		}

		/**
		 *
		 * @param id
		 * @param audioResource
		 * @param volume
		 * @param loop
		 */
		var play = function( id, audioResource, volume, loop ) {
			var audioElement = ( _.has( audioElements, id ) ) ? audioElements[id] : create( id, audioResource )

			setLoop( id, loop )
			setVolume( id, volume )

			if( isMuted() ) mute( id )

			//This should never happen, but if, then free object
			audioElement.addEventListener( 'ended', removeCallback, false )
			audioElement.addEventListener( 'play', playingCallback, false )

			audioElement.play()
		}

		var stop = function( id ) {
			var audioElement = audioElements[ id ]

			audioElement.playing = false
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

			if( loop ) audioElement.addEventListener( 'pause', loopCallback, false )
			else audioElement.addEventListener( 'pause', removeCallback, false )
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
			audioElement.removeEventListener( 'timeupdate', pauseCallback, false )
			audioElement.removeEventListener( 'pause', removeCallback, false )
			audioElement.removeEventListener( 'playing', playingCallback, false )

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

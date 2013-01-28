define(
	'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
	[
		'spell/shared/util/platform/private/sound/createFixedSoundFileSrc'
	],
	function(
		createFixedSoundFileSrc
	) {
		'use strict'


		var audioElements = {},
			isMutedValue  = false,
			nextSoundId   = 0

		var createSoundId = function() {
			return nextSoundId++
		}

		var create = function( id, audioResource ) {
			var audio

			if( audioResource.privateAudioResource.cloneNode ) {
				audio = audioResource.privateAudioResource.cloneNode( true )

			} else {
				audio = new Audio()
				audio.src = audioResource.privateAudioResource.src
			}

			audio.id = id

			return audio
		}

		var loopCallback = function( event ) {
			var currentTarget = event.currentTarget

			currentTarget.currentTime = 0
			currentTarget.play()
		}

		var removeCallback = function( event ) {
			var currentTarget = event.currentTarget

			currentTarget.removeEventListener( 'ended', removeCallback, true )
			currentTarget.removeEventListener( 'ended', loopCallback, true )
			currentTarget.pause()

			delete audioElements[ currentTarget.id ]
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
				id = createSoundId()
			}

			var audioElement

			if( audioElements[ id ] ) {
				audioElement = audioElements[ id ]

			} else {
				audioElement = create( id, audioResource )
				audioElements[ id ] = audioElement
			}

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

			audioElement.currentTime = 0
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

			audioElement.loop = loop

			if( loop ) {
				audioElement.addEventListener( 'ended', loopCallback, true )
				audioElement.removeEventListener( 'ended', removeCallback, true )

			} else {
				audioElement.addEventListener( 'ended', removeCallback, true )
				audioElement.removeEventListener( 'ended', loopCallback, true )
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

		var tick = function() {}

		var onError = function( event ) {
			throw 'Error: Could not load sound resource "' + event.currentTarget.src + '".'
		}

		var loadBuffer = function( src, onLoadCallback ) {
			if( !src ) {
				throw 'Error: No src provided.'
			}

			if( !onLoadCallback ) {
				throw 'Error: No onLoadCallback provided.'
			}

			var audioElement = new Audio()

			var canPlayThroughCallback = function( event ) {
				var currentTarget = event.currentTarget

				currentTarget.removeEventListener( 'canplaythrough', canPlayThroughCallback, true )
				currentTarget.removeEventListener( 'error', onError, true )

				currentTarget.currentTime = 0
				currentTarget.pause()

				onLoadCallback( currentTarget )
			}

			audioElement.addEventListener( 'canplaythrough', canPlayThroughCallback, true )
			audioElement.addEventListener( 'error', onError, true )

			audioElement.playing = false
			audioElement.src = createFixedSoundFileSrc( src )

			// old WebKit
			audioElement.autobuffer = 'auto'

			// new WebKit
			audioElement.preload = 'auto'
			audioElement.load()
			audioElement.play()
			audioElement.volume = 0
		}

		var createSound = function( buffer ) {
			return {
				/*
				 * Public
				 */
				duration : buffer.duration,

				/*
				 * Private
				 *
				 * This is an implementation detail of the class. If you write code that depends on this you better know what you are doing.
				 */
				privateAudioResource : buffer
			}
		}

		/*
		 * Returns an audio context. Once a context has been created additional calls to this method return the same instance.
		 *
		 * @param sound - the audio element
		 */
		var createAudioContext = function() {
			var context = new Audio()

			if( !context ) return null

			return createWrapperContext()
		}

		/*
		 * Creates a wrapper context for the back-end context.
		 */
		var createWrapperContext = function() {
			return {
				tick             : tick,
				play             : play,
				setLoop          : setLoop,
				setVolume        : setVolume,
				setAllMuted      : setMute,
				isAllMuted       : isMuted,
				stop             : stop,
				mute             : mute,
				createSound      : createSound,
				stopAll          : stopAll,
				resumeAll        : resumeAll,
				loadBuffer       : loadBuffer,
				getConfiguration : function() { return { type : 'html5' } }
			}
		}

		return createAudioContext
	}
)

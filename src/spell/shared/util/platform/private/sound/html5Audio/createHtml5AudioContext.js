define(
	'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
	[
		'spell/shared/util/platform/private/sound/createFixedSoundFileSrc',

		'spell/functions'
	],
	function(
		createFixedSoundFileSrc,

		_
	) {
		'use strict'

		/*
		 * private
		 */
		var audioElements  = {},
			isMutedValue   = false,
			soundIdCounter = 0

		var create = function( id, audioResource ) {
			var audio

//			if( audioResource.privateAudioResource.cloneNode ) {
//				audio = audioResource.privateAudioResource.cloneNode( true )
//
//			} else {
				audio = new Audio()
				audio.src = audioResource.privateAudioResource.src
//			}

			audio.id = id

			return audio
		}

		var loopCallback = function() {
			this.currentTime = 0
			this.play()
		}

		var removeCallback = function() {
			destroy( this )
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

			var audioElement

			if( audioElements[ id ] ) {
				audioElement = audioElements[ id ]

			} else {
				audioElement = create( id, audioResource )
				audioElements[ id ] = audioElement
			}

			console.log( 'created ' + audioElement.id )

			setLoop( id, loop )
			setVolume( id, volume )

			if( isMuted() ) {
				mute( id )
			}

			console.log( audioElement )

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

//			audioElement.currentTime = 0
			audioElement.pause()
		}

		var setVolume = function ( id, volume ) {
			volume = !isNaN( volume ) && volume < 1 && volume >= 0 ? volume : 1

			var audioElement = audioElements[ id ]
			if( !audioElement ) return

			audioElement.volume = volume
		}

		var setLoop = function( id, loop ) {
			console.log( 'setLoop ' + id + ' -> ' + loop )

			var audioElement = audioElements[ id ]
			if( !audioElement ) return

			audioElement.loop = loop

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

		var destroy = function( audioElement ) {
			audioElement.removeEventListener( 'ended', removeCallback, false )
			audioElement.removeEventListener( 'ended', loopCallback, false )
			audioElement.pause()

			console.log( 'destroying ' + audioElement.id )

			delete audioElements[ audioElement.id ]

			console.log( '# audioElements: ' + _.size( audioElements ) )
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

		var loadBuffer = function( src, onLoadCallback ) {
			if( !src ) {
				throw 'Error: No src provided.'
			}

			if( !onLoadCallback ) {
				throw 'Error: No onLoadCallback provided.'
			}

			var audio = new Audio()

			var canPlayThroughCallback = function() {
				audio.removeEventListener( 'canplaythrough', canPlayThroughCallback, false )
				audio.currentTime = 0
				audio.pause()

				onLoadCallback( audio )
			}

			audio.addEventListener( 'canplaythrough', canPlayThroughCallback, false )

			audio.addEventListener(
				'error',
				function() {
					throw 'Error: Could not load sound resource "' + audio.src + '".'
				},
				false
			)

			audio.playing = false
			audio.src = createFixedSoundFileSrc( src )

			// old WebKit
			audio.autobuffer = 'auto'

			// new WebKit
			audio.preload = 'auto'
			audio.load()
			audio.play()
			audio.volume = 0
		}

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
				createSound : createSound,
				stopAll     : stopAll,
				resumeAll   : resumeAll,
				loadBuffer  : loadBuffer
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

		return createAudioContext
	}
)

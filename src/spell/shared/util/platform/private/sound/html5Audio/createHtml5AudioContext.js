define(
	'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
	[
		'spell/shared/util/createNormalizedVolume',
		'spell/shared/util/platform/private/sound/createFixedSoundFileSrc',
		'spell/shared/util/platform/private/sound/createSoundId'
	],
	function(
		createNormalizedVolume,
		createFixedSoundFileSrc,
		createSoundId
	) {
		'use strict'


		var MAX_NUM_CHANNELS = 16 // the maximum amount of concurrently playing audio elements

		var audioElements        = {},
			isMutedValue         = false,
			numFreeChannels      = MAX_NUM_CHANNELS,
			isContextPausedValue = false

		var create = function( id, soundResource ) {
			var audio

			if( soundResource.resource.cloneNode ) {
				audio = soundResource.resource.cloneNode( true )

			} else {
				audio = new Audio()
				audio.src = soundResource.resource.src
			}

			audio.id = id
			audio.playing = false

			return audio
		}

		var loopCallback = function() {
			this.currentTime = 0
			this.play()
		}

		var removeCallback = function() {
			free( this )
		}

		var free = function( audioElement ) {
			audioElement.pause()

			audioElement.removeEventListener( 'ended', removeCallback, true )
			audioElement.removeEventListener( 'ended', loopCallback, true )

			numFreeChannels++

			delete audioElements[ audioElement.id ]
		}


		/**
		 * @param {SoundAsset} soundAsset
		 * @param volume
		 * @param loop
		 */
		var play = function( soundAsset, volume, loop ) {
			var id           = createSoundId(),
				audioElement = audioElements[ id ]

			if( !audioElement &&
				numFreeChannels > 0 ) {

				// when a free channel exists play the sound
				numFreeChannels--

				audioElement = create( id, soundAsset.resource )
				audioElements[ id ] = audioElement
			}

			if( audioElement ) {
				setLoop( id, loop )

				if( !audioElement.playing ) {
					audioElement.playing = true
					audioElement.play()
				}

				//set volume after play. In some browser it won't have an effect otherwise
				setVolume( id, volume )
				if( isContextMuted() ) {
					mute( id )
				}
			}

			return id
		}

		var stop = function( id ) {
			var audioElement = audioElements[ id ]
			if( !audioElement ) return

			free( audioElement )
		}

		var setVolume = function ( id, volume ) {
			var audioElement = audioElements[ id ]
			if( !audioElement ) return


			audioElement.volume = audioElement.sourceVolume = createNormalizedVolume( volume )
		}

		var setLoop = function( id, loop ) {
			var audioElement = audioElements[ id ]
			if( !audioElement ) return

			audioElement.loop = !!loop

			if( loop ) {
				audioElement.addEventListener( 'ended', loopCallback, true )
				audioElement.removeEventListener( 'ended', removeCallback, true )

			} else {
				audioElement.addEventListener( 'ended', removeCallback, true )
				audioElement.removeEventListener( 'ended', loopCallback, true )
			}
		}

		var mute = function( id ) {
			var audioElement = audioElements[ id ]

			if( audioElement ) {
				audioElement.volume = 0
			}
		}

		var unmute = function( id ) {
			var audioElement = audioElements[ id ]

			if( audioElement ) {
				audioElement.volume = audioElement.sourceVolume
			}
		}

		var muteContext = function() {
			for( var id in audioElements ) {
				mute( id )
			}

			isMutedValue = true
		}

		var unmuteContext = function() {
			for( var id in audioElements ) {
				unmute( id )
			}

			isMutedValue = false
		}

		var isContextMuted = function() {
			return isMutedValue
		}

		var pause = function( id ) {
			var audioElement = audioElements[ id ]

			if( audioElement ) {
				audioElement.pause()
			}
		}

		var resume = function( id ) {
			var audioElement = audioElements[ id ]

			if( audioElement ) {
				audioElement.play()
			}
		}

		var pauseContext = function() {
			for( var id in audioElements ) {
				pause( id )
			}

			isContextPausedValue = true
		}

		var resumeContext = function() {
			for( var id in audioElements ) {
				resume( id )
			}

			isContextPausedValue = false
		}

		var isContextPaused = function() {
			return isContextPausedValue
		}

		var tick = function() {}

		var loadBuffer = function( src, isMusic, onLoadCallback ) {
			if( !src ) {
				throw 'Error: No src provided.'
			}

			if( !onLoadCallback ) {
				throw 'Error: No onLoadCallback provided.'
			}

			var audioElement = new Audio()

			audioElement.src = createFixedSoundFileSrc( src )

			// old webkit
			if( audioElement.autobuffer ) {
				audioElement.autobuffer = 'auto'
			}

			// new webkit
			if( audioElement.preload ) {
				audioElement.preload = 'auto'
			}

			audioElement.load()

			onLoadCallback( audioElement )
		}

		/*
		 * Returns a SoundResource instance.
		 *
		 * @param buffer
		 * @return {SoundResource}
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
				resource : buffer
			}
		}

		/*
		 * Returns an audio context. Once a context has been created additional calls to this method return the same instance.
		 *
		 * @return {Object}
		 */
		var createAudioContext = function() {
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
				pause            : pause,
				resume           : resume,
				stop             : stop,
				mute             : mute,
				unmute           : unmute,
				muteContext      : muteContext,
				unmuteContext    : unmuteContext,
				isContextMuted   : isContextMuted,
				pauseContext     : pauseContext,
				resumeContext    : resumeContext,
				isContextPaused  : isContextPaused,
				createSound      : createSound,
				loadBuffer       : loadBuffer,
				getConfiguration : function() { return { type : 'web' } }
			}
		}

		return createAudioContext
	}
)

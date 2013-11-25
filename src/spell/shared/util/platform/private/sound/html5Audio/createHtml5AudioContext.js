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

		var audioElements   = {},
			isMutedValue    = false,
			numFreeChannels = MAX_NUM_CHANNELS

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
				setVolume( id, volume )

				if( isMuted() ) {
					mute( id )
				}

				if( !audioElement.playing ) {
					audioElement.playing = true
					audioElement.play()
				}
			}

			return id
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

			free( audioElement )
		}

		var setVolume = function ( id, volume ) {
			var audioElement = audioElements[ id ]
			if( !audioElement ) return

			audioElement.volume = createNormalizedVolume( volume )
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

		var loadBuffer = function( src, soundAsset, onLoadCallback ) {
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
				setAllMuted      : setMute,
				isAllMuted       : isMuted,
				stop             : stop,
				mute             : mute,
				createSound      : createSound,
				loadBuffer       : loadBuffer,
				getConfiguration : function() { return { type : 'html5' } }
			}
		}

		return createAudioContext
	}
)

define(
	'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
	[
		'spell/shared/util/platform/private/isHtml5CocoonJS',
		'spell/shared/util/platform/private/sound/createFixedSoundFileSrc',
		'spell/shared/util/platform/private/sound/createSoundId'
	],
	function(
		isHtml5CocoonJS,
		createFixedSoundFileSrc,
		createSoundId
	) {
		'use strict'


		var MAX_NUM_CHANNELS = 16 // the maximum amount of concurrently playing audio elements

		var audioElements   = {},
			isMutedValue    = false,
			numFreeChannels = MAX_NUM_CHANNELS

		var create = function( id, audioResource ) {
			var audio

			if( !isHtml5CocoonJS &&
				audioResource.privateAudioResource.cloneNode ) {
				audio = audioResource.privateAudioResource.cloneNode( true )

			} else {
				audio = new Audio()
				audio.src = audioResource.privateAudioResource.src
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
		 * @param {AudioResource} audioResource
		 * @param id
		 * @param volume
		 * @param loop
		 */
		var play = function( audioAsset, id, volume, loop ) {
			if( !id ) {
				id = createSoundId()
			}

			var audioElement = audioElements[ id ]

			if( !audioElement &&
				numFreeChannels > 0 ) {

				// when a free channel exists play the sound
				numFreeChannels--

				audioElement = create( id, audioAsset.resource )
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

		var loadBuffer = function( src, audioAsset, onLoadCallback ) {
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
		 * Returns a AudioResource instance.
		 *
		 * @param buffer
		 * @return {AudioResource}
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

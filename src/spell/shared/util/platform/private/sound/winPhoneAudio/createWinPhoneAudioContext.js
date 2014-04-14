define(
	'spell/shared/util/platform/private/sound/winPhoneAudio/createWinPhoneAudioContext',
	[
		'spell/shared/util/createNormalizedVolume',
		'spell/shared/util/platform/private/sound/createFixedSoundFileSrc',
		'spell/shared/util/platform/private/sound/createSoundId',
		'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext'
	],
	function(
		createNormalizedVolume,
		createFixedSoundFileSrc,
		createSoundId,
		createHtml5AudioContext
	) {
		'use strict'


		var isMutedValue         = false
		var html5AudioContext    = createHtml5AudioContext()
		var isContextPausedValue = false

		var generateRequest = function( params ) {
			return params.join( ';' )
		}

		var sendNotification = function() {
			window.external.notify( generateRequest( Array.prototype.slice.call(arguments) ) )
		}

		/**
		 * @param {SoundAsset} soundAsset
		 * @param volume
		 * @param loop
		 */
		var play = function( soundAsset, volume, loop ) {
			var id  = createSoundId(),
				src = soundAsset.resource.resource.src

			volume = createNormalizedVolume( volume )
			loop   = !!loop

			if( soundAsset.isMusic ) {
				html5AudioContext.loadBuffer( src, true, function() {
					if( isContextMuted() ) {
						html5AudioContext.muteContext()
					}

					html5AudioContext.play( soundAsset, volume, loop )
				})

			} else {
				sendNotification( 'playSound', id, src, volume, loop )
			}

			return id
		}

		var stop = function( id ) {
			sendNotification( 'stopSound', id )
		}

		var setVolume = function ( id, volume ) {
			var volume = createNormalizedVolume( volume )

			sendNotification( 'setVolume', id, volume )
		}

		var setLoop = function( id, loop ) {
			sendNotification( 'setLoop', id, !!loop )
		}

		var mute = function( id ) {
			sendNotification( 'mute', id )
		}

		var unmute = function( id ) {
			sendNotification( 'unmute', id )
		}

		var muteContext = function() {
			html5AudioContext.muteContext()
			sendNotification( 'muteContext' )

			isMutedValue = true
		}

		var unmuteContext = function() {
			html5AudioContext.unmuteContext()
			sendNotification( 'unmuteContext' )

			isMutedValue = false
		}

		var isContextMuted = function() {
			return isMutedValue
		}

		var pause = function( id ) {
			sendNotification( 'pause', id )
		}

		var resume = function( id ) {
			sendNotification( 'resume', id )
		}

		var pauseContext = function() {
			html5AudioContext.pauseContext()
			sendNotification( 'pauseContext' )

			isContextPausedValue = true
		}

		var resumeContext = function() {
			html5AudioContext.resumeContext()
			sendNotification( 'resumeContext' )

			isContextPausedValue = false
		}

		var isContextPaused = function() {
			return isContextPausedValue
		}

		var tick = function() {}

		var loadBuffer = function( src, soundAsset, onLoadCallback ) {
			if( !src ) {
				throw 'Error: No src provided.'
			}

			if( !onLoadCallback ) {
				throw 'Error: No onLoadCallback provided.'
			}

			var src = createFixedSoundFileSrc( src )

			sendNotification( 'loadBuffer', src )

			onLoadCallback( { src: src } )
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
				getConfiguration : function() { return { type : 'winPhone' } }
			}
		}

		return createAudioContext
	}
)

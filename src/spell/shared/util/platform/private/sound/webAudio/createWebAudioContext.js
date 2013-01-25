define(
	'spell/shared/util/platform/private/sound/webAudio/createWebAudioContext',
	[
		'spell/shared/util/platform/private/sound/createFixedSoundFileSrc',

		'spell/functions'
	],
	function(
		createFixedSoundFileSrc,

		_
	) {
		'use strict'


		var context,
			sourceNodes  = {},
			isMutedValue = false,
			nextSoundId  = 0

		var createSoundId = function() {
			return nextSoundId++
		}

		var create = function( id, audioResource ) {
			var gainNode   = context.createGainNode(),
				sourceNode = context.createBufferSource()

			sourceNode.buffer = audioResource.privateAudioResource

			sourceNode.connect( gainNode )
			gainNode.connect( context.destination )

			sourceNodes[ id ] = sourceNode
			return sourceNode
		}

		/**
		 *
		 * @param audioResource
		 * @param id
		 * @param volume
		 * @param loop
		 */
		var play = function( audioResource, id, volume, loop ) {
			id     = id ? id : createSoundId()
			loop   = !!loop
			volume = volume ? volume : 1

			var sourceNode = _.has( sourceNodes, id ) ?
				sourceNodes[ id ] :
				create( id, audioResource )

			setLoop( id, loop )
			setVolume( id, volume )

			if( isMuted() ) mute( id )

			if( sourceNode.playbackState !== sourceNode.PLAYING_STATE ) {
				sourceNode.noteOn( 0 )
			}
		}

		var stopAll = function() {
			_.each( sourceNodes, function( value, key ) {
				mute( key )
			} )
		}

		var resumeAll = function() {
			_.each( sourceNodes, function( value, key ) {
				setVolume( key, 1 )
			} )
		}

		var stop = function( id ) {
			var sourceNode = sourceNodes[ id ]
			if( sourceNode ) sourceNode.noteOff(0)
		}

		var setVolume = function ( id, volume ) {
			volume = !isNaN( volume ) ? volume : 1
			var sourceNode = sourceNodes[ id ]
			if( sourceNode ) sourceNode.gain.value = volume
		}

		var setLoop = function( id, loop ) {
			loop = !!loop
			var sourceNode = sourceNodes[ id ]
			if( sourceNode ) sourceNode.loop = loop
		}

		var mute = function( id ) {
			var sourceNode = sourceNodes[ id ]
			if( sourceNode ) sourceNode.gain.value = 0
		}

		var destroy = function( id ) {
			stop( id )

			sourceNodes[ id ] = null
			delete sourceNodes[ id ]
		}

		/**
		 * Looks through the sourceNodes and cleans up finished nodes
		 */
		var tick = function() {
			for( var id in sourceNodes ) {
				var sourceNode = sourceNodes[ id ]

				if( sourceNode.playbackState === sourceNode.FINISHED_STATE ) {
					destroy( id )
				}
			}
		}

		var setMute = function( isMute ) {
			if( isMute === true ) {
				_.each( sourceNodes, function( value, key ) {
					mute( key )
				} )
			} else {
				_.each( sourceNodes, function( value, key ) {
					setVolume( key, 1 )
				} )
			}

			isMutedValue = isMute
		}

		var isMuted = function() {
			return isMutedValue
		}

		var loadBuffer = function( src, onLoadCallback ) {
			if( !src ) {
				throw 'Error: No src provided.'
			}

			if( !onLoadCallback ) {
				throw 'Error: No onLoadCallback provided.'
			}

			var request = new XMLHttpRequest()

			request.open( 'GET', createFixedSoundFileSrc( src ), true )
			request.responseType = 'arraybuffer'

			request.onload = function() {
				context.decodeAudioData(
					request.response,
					onLoadCallback
				)
			}

			request.onError = function() {
				throw 'Error: Could not load sound resource "' + config.resource + '".'
			}

			request.send()
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
		 * Returns a audio context. Once a context has been created additional calls to this method return the same context instance.
		 *
		 * @param sound - the audio element
		 */
		var createAudioContext = function() {
			if( context ) return context

			context = new webkitAudioContext()

			return createWrapperContext()
		}

		/*
		 * Returns instance of audio class
		 *
		 * @param audioBuffer
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

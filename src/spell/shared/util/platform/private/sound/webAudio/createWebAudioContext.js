define(
	'spell/shared/util/platform/private/sound/webAudio/createWebAudioContext',
	[
		'spell/shared/util/createNormalizedVolume',
		'spell/shared/util/platform/private/sound/createFixedSoundFileSrc',
		'spell/shared/util/platform/private/sound/createSoundId',

		'spell/functions'
	],
	function(
		createNormalizedVolume,
		createFixedSoundFileSrc,
		createSoundId,

		_
	) {
		'use strict'


		var PLAYING_STATE = {
			 INIT: 0,
 			 PLAYING: 1,
			 PAUSED: 2,
			 FINISHED: 3
		}

		var SourceNodeWrapper = function( soundResource, volume, loop ) {
			this.volume             = volume
			this.loop               = loop
			this.startOffsetContext = 0
			this.pauseOffsetContext = 0
			this.startOffset        = 0
			this.state              = PLAYING_STATE.INIT

			this.soundResource = soundResource
		}

		SourceNodeWrapper.prototype = {


			play: function() {
				if( !this.node ||
					this.node.playbackState !== this.node.PLAYING_STATE ) {

					var gainNode    = context.createGainNode(),
						startOffset = this.startOffset + this.pauseOffsetContext - this.startOffsetContext

					this.node = context.createBufferSource()
					this.node.buffer = this.soundResource.resource
					this.node.connect( gainNode )

					gainNode.connect( context.destination )

					this.startOffsetContext = context.currentTime
					this.startOffset = startOffset % this.node.buffer.duration

					this.node.gain.value = isMuted() ? 0 : this.volume
					this.node.loop = this.loop
					this.state = PLAYING_STATE.PLAYING

					this.node.start( 0, this.startOffset )
				}
			}
		}

		var context,
			sourceNodes     = {},
			isMutedValue    = false,
			isContextPaused = false

		var create = function( id, soundResource, volume, loop, offset ) {
			volume = createNormalizedVolume( volume )
			loop   = !!loop
			offset = offset || 0

			var sourceNode = new SourceNodeWrapper( soundResource, volume, loop, offset )
			sourceNodes[ id ] = sourceNode

			return sourceNode
		}

		/**
		 * @param {SoundAsset} soundAsset
		 * @param volume
		 * @param loop
		 */
		var play = function( soundAsset, volume, loop ) {
			var id = createSoundId()

			var sourceNode = _.has( sourceNodes, id ) ?
				sourceNodes[ id ] :
				create( id, soundAsset.resource )

			setLoop( id, loop )
			setVolume( id, volume )

			sourceNode.play()

			return id
		}

		var stop = function( id ) {
			var sourceNode = sourceNodes[ id ]

			if( sourceNode &&
				sourceNode.node.playbackState === sourceNode.node.PLAYING_STATE ) {

				sourceNode.node.stop( 0 )
			}
		}

		var setVolume = function ( id, volume ) {
			var sourceNode = sourceNodes[ id ]

			if( sourceNode ) {
				sourceNode.volume =  createNormalizedVolume( volume )

				if( sourceNode.node ) {
					sourceNode.node.gain.value = sourceNode.volume
				}
			}
		}

		var setLoop = function( id, loop ) {
			var sourceNode = sourceNodes[ id ]

			if( sourceNode ) {
				sourceNode.loop = !!loop

				if( sourceNode.node ) {
					sourceNode.node.loop = sourceNode.loop
				}
			}
		}

		var mute = function( id ) {
			var sourceNode = sourceNodes[ id ]

			if( sourceNode ) {
				sourceNode.node.gain.value = 0
			}
		}

		var unmute = function( id ) {
			var sourceNode = sourceNodes[ id ]

			if( sourceNode ) {
				sourceNode.node.gain.value = sourceNode.volume
			}
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

				if( sourceNode.state != PLAYING_STATE.PAUSED &&
					sourceNode.node.playbackState === sourceNode.node.FINISHED_STATE ) {

					destroy( id )
				}
			}
		}

		var muteContext = function() {
			_.each( sourceNodes, function( value, key ) {
				mute( key )
			} )

			isMutedValue = true
		}

		var unmuteContext = function() {
			_.each( sourceNodes, function( value, key ) {
				unmute( key )
			} )

			isMutedValue = false
		}

		var resumeContext = function() {
			_.each( sourceNodes, function( value, key ) {
				resume( key )
			} )

			isContextPaused = false
		}

		var pauseContext = function() {
			_.each( sourceNodes, function( value, key ) {
				pause( key )
			} )

			isContextPaused = true
		}

		var isContextMuted = function() {
			return isMutedValue
		}

		var getIsContextPaused = function() {
			return isContextPaused
		}

		var isMuted = function() {
			return isMutedValue
		}

		var pause = function( id ) {
			var sourceNode = sourceNodes[ id ]

			if( sourceNode &&
				sourceNode.node.playbackState === sourceNode.node.PLAYING_STATE ) {

				sourceNode.state = PLAYING_STATE.PAUSED
				sourceNode.pauseOffsetContext = context.currentTime
				sourceNode.node.stop( 0 )
			}
		}

		var resume = function( id ) {
			var sourceNode = sourceNodes[ id ]

			if( sourceNode &&
				sourceNode.node.playbackState !== sourceNode.node.PLAYING_STATE ) {

				sourceNode.play()
			}
		}

		var loadBuffer = function( src, soundAsset, onLoadCallback ) {
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
				isContextPaused  : getIsContextPaused,
				createSound      : createSound,
				loadBuffer       : loadBuffer,
				getConfiguration : function() { return { type : 'web' } }
			}
		}

		/*
		 * Returns a audio context. Once a context has been created additional calls to this method return the same context instance.
		 *
		 * @return {Object}
		 */
		var createAudioContext = function() {
			if( context ) return context

			context = new webkitAudioContext()

			return createWrapperContext()
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

		return createAudioContext
	}
)

/**
 * @class audio
 * @singleton
 */

define(
	'spell/system/audio',
	[
		'spell/Defines'
	],
	function(
		Defines
	) {
		'use strict'


		var playSound = function( entityManager, audioContext, id, soundEmitter ) {
			if( soundEmitter.mute ||
				audioContext.isContextMuted() ) {

				audioContext.mute( id )
			}

			if( !soundEmitter.play ) {
				audioContext.play( soundEmitter.asset, soundEmitter.volume, soundEmitter.loop )

				soundEmitter.play = true

			} else {
				audioContext.setLoop( id, soundEmitter.loop )
				audioContext.setVolume( id, soundEmitter.volume )
			}
		}

		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var audio = function( spell ) {
			this.soundEmitterUpdatedHandler = null
			this.visibilityChangedHandler = null
		}

		audio.prototype = {
			/**
		 	 * Gets called when the system is created.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
				var audioContext  = spell.audioContext,
					entityManager = spell.entityManager,
					eventManager  = spell.eventManager

				this.soundEmitterUpdatedHandler = function( soundEmitter, id ) {
					playSound( entityManager, audioContext, id, soundEmitter )
				}

				this.visibilityChangedHandler = function( isVisible ) {
					if( isVisible ) {
						audioContext.resumeContext()

					} else {
						audioContext.pauseContext()
					}

				}

				eventManager.subscribe(
					[ eventManager.EVENT.COMPONENT_CREATED, Defines.SOUND_EMITTER_COMPONENT_ID ],
					this.soundEmitterUpdatedHandler
				)

				eventManager.subscribe(
					[ eventManager.EVENT.COMPONENT_UPDATED, Defines.SOUND_EMITTER_COMPONENT_ID ],
					this.soundEmitterUpdatedHandler
				)

				eventManager.subscribe(
					eventManager.EVENT.VISIBILITY_CHANGED,
					this.visibilityChangedHandler
				)
			},

			/**
		 	 * Gets called when the system is destroyed.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			destroy: function( spell ) {
				var eventManager = spell.eventManager

				eventManager.unsubscribe(
					[ eventManager.EVENT.COMPONENT_CREATED, Defines.SOUND_EMITTER_COMPONENT_ID ],
					this.soundEmitterUpdatedHandler
				)

				eventManager.unsubscribe(
					[ eventManager.EVENT.COMPONENT_UPDATED, Defines.SOUND_EMITTER_COMPONENT_ID ],
					this.soundEmitterUpdatedHandler
				)

				eventManager.unsubscribe(
					eventManager.EVENT.VISIBILITY_CHANGED,
					this.visibilityChangedHandler
				)
			},

			/**
		 	 * Gets called when the system is activated.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			activate: function( spell ) {
			},

			/**
		 	 * Gets called when the system is deactivated.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {
				var audioContext  = spell.audioContext,
					soundEmitters = this.soundEmitters

				for( var id in soundEmitters ) {
					audioContext.stop( id )
				}

				audioContext.tick()
			},

			/**
		 	 * Gets called to trigger the processing of game state.
		 	 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {
				spell.audioContext.tick()
			}
		}

		return audio
	}
)

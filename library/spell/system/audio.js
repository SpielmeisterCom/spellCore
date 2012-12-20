/**
 * @class audio
 * @singleton
 */

define(
	'spell/system/audio',
	function() {
		'use strict'


		var playSound = function( audioContext, id, soundEmitter ) {
			audioContext.play(
				soundEmitter.asset.resource,
				id,
				soundEmitter.volume,
				soundEmitter.loop
			)
		}


		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var audio = function( spell ) {

		}

		audio.prototype = {
			/**
		 	 * Gets called when the system is created.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {

			},

			/**
		 	 * Gets called when the system is destroyed.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			destroy: function( spell ) {

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
				var soundEmitters = this.soundEmitters,
					entityManager = spell.entityManager,
					audioContext  = spell.audioContext

				for( var id in soundEmitters ) {
					audioContext.stop( id )

					entityManager.updateComponent(
						id,
						'spell.component.audio.soundEmitter',
						{
							play : false
						}
					)
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
				var soundEmitters = this.soundEmitters,
					entityManager = spell.entityManager,
					audioContext  = spell.audioContext

				audioContext.tick()

				for( var id in soundEmitters ) {
					var soundEmitter = soundEmitters[ id ]

					if(	!soundEmitter.play ) {
						playSound( audioContext, id, soundEmitter )

						entityManager.updateComponent(
							id,
							'spell.component.audio.soundEmitter',
							{
								play : true
							}
						)
					}

					audioContext.setLoop( id, soundEmitter.loop )
					audioContext.setVolume( id, soundEmitter.volume )

					if( soundEmitter.mute ||
						audioContext.isAllMuted() ) {

						audioContext.mute( id )
					}
				}
			}
		}

		return audio
	}
)

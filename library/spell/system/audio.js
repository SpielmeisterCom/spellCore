/**
 * @class audio
 * @singleton
 */

define(
	'spell/system/audio',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'
		
		
		
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
				
			},

			playSound: function( audioContext, id, soundEmitter ) {
				audioContext.play( id, soundEmitter.asset.resource, soundEmitter.volume, soundEmitter.loop )
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
					audioContext  = spell.audioContext

				audioContext.tick()

				for( var id in soundEmitters ) {
					var soundEmitter = soundEmitters[ id ]
					this.prototype.playSound( audioContext, id, soundEmitter )

					audioContext.setLoop( id, soundEmitter.loop )
					audioContext.setVolume( id, soundEmitter.volume )

					if( soundEmitter.mute || audioContext.isAllMuted() ) audioContext.mute( id )
				}
			}
		}
		
		return audio
	}
)

/**
 * @class spell.system.debug.camera
 * @singleton
 */

define(
	'spell/system/debug/camera',
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
		var camera = function( spell ) {

		}

		camera.prototype = {
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

			/**
			 * Gets called to trigger the processing of game state.
			 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {

			}
		}

		return camera
	}
)

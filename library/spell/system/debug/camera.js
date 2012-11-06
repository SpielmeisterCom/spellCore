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

		var getActiveCameraId = function( cameras ) {
			if( !cameras || _.size( cameras ) === 0 ) return

			// Gets the first active camera. More than one camera being active is an undefined state and the first found active is used.
			var activeCameraId = undefined

			_.any(
				cameras,
				function( camera, id ) {
					if( camera.active ) {
						activeCameraId = id

						return true
					}

					return false
				}
			)

			return activeCameraId
		}


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
				//find current active camera
				this.lastActiveCameraId = getActiveCameraId( this.cameras )

				spell.entityManager.updateComponent(
					this.lastActiveCameraId,
					'spell.component.2d.graphics.camera', {
					'active': false
				})

				//create editor camera
				this.editorCameraEntityId = spell.entityManager.createEntity({
					templateId: 'spell.entity.2d.graphics.camera',
					config: {
						"spell.component.2d.transform": {},
						"spell.component.2d.graphics.camera": {
							"active": true
						}
					}
				})
			},

			/**
			 * Gets called when the system is deactivated.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {

				spell.entityManager.updateComponent( this.lastActiveCameraId, 'spell.component.2d.graphics.camera', {
					'active': true
				})

				spell.entityManager.removeEntity( this.editorCameraEntityId )
				this.editorCameraEntityId = undefined
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

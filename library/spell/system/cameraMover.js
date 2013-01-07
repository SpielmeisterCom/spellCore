/**
 * @class spell.system.cameraMover
 * @singleton
 */

define(
	'spell/system/cameraMover',
	function() {
		'use strict'


		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var cameraMover = function( spell ) {
			this.cameraIdToFollowEntityName = {}
		}

		cameraMover.prototype = {
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
				var cameraIdToFollowEntityName = this.cameraIdToFollowEntityName,
					cameraMovements            = this.cameraMovements,
					transforms                 = this.transforms

				for( var cameraId in cameraMovements ) {
					var cameraMovement    = cameraMovements[ cameraId ],
						cameraTranslation = transforms[ cameraId ].translation,
						followEntityName  = cameraIdToFollowEntityName[ cameraId ],
						followEntityId    = cameraMovement.followEntityId

					if( cameraMovement.followEntityName &&
						cameraMovement.followEntityName !== followEntityName ) {

						// the camera follows another entity now
						followEntityName = cameraMovement.followEntityName
						followEntityId = spell.entityManager.getEntityIdsByName( followEntityName )[ 0 ]

						if( followEntityId ) {
							cameraMovement.followEntityId = followEntityId
							cameraIdToFollowEntityName[ cameraId ] = followEntityName
						}
					}

					if( followEntityId ) {
						var entityTranslation = transforms[ followEntityId ].translation

						if( !cameraTranslation || !entityTranslation ) {
							throw 'Either the camera or the entity ' + followEntityName + ' does not have a transform component.'
						}

						cameraTranslation[ 0 ] = entityTranslation[ 0 ]
						cameraTranslation[ 1 ] = entityTranslation[ 1 ]
					}

					if( cameraMovement.obeyMinMax ) {
						var minX = cameraMovement.minX,
							maxX = cameraMovement.maxX,
							minY = cameraMovement.minY,
							maxY = cameraMovement.maxY

	 					if( cameraTranslation[ 0 ] < minX ) {
					    	cameraTranslation[ 0 ] = minX
					    }

					    if( cameraTranslation[ 0 ] > maxX ) {
					    	cameraTranslation[ 0 ] = maxX
					    }

					    if( cameraTranslation[ 1 ] < minY ) {
					    	cameraTranslation[ 1 ] = minY
					    }

					    if( cameraTranslation[ 1 ] > maxY ) {
					    	cameraTranslation[ 1 ] = maxY
					    }
					}
				}
			}
		}

		return cameraMover
	}
)

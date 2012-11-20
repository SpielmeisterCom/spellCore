/**
 * @class spell.system.cameraMover
 * @singleton
 */

define(
	'spell/system/cameraMover',
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
		var cameraMover = function( spell ) {

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
				
				for( var cameraEntityId in this.cameraMovements ) {
					
					var cameraMovement		= this.cameraMovements[ cameraEntityId ],
						followEntityName   	= cameraMovement.followEntityName
						
					if( !followEntityName ) {
						throw 'cameraMovement: did not specify an followEntityName which specifies the entity to follow in the cameraFollow component'
					}
					
					var entityIdsToFollow = spell.entityManager.getEntityIdsByName( followEntityName )
					
					if ( entityIdsToFollow.length < 1 ) {
						continue
					}
					
					var entityIdToFollow = entityIdsToFollow[ 0 ],
						entityTransform = this.transforms[ entityIdToFollow ],
						cameraTransform = this.transforms[ cameraEntityId ]
						
					if ( !entityTransform || !cameraTransform ) {
						throw 'cameraMovement: either the camera or the entity ' + followEntityName + ' does not have a transform component set'
						continue
					}
	
					var cameraTranslation = cameraTransform.translation,
						entityTranslation = entityTransform.translation
					
				    cameraTranslation[ 0 ] = entityTranslation[ 0 ]
				    cameraTranslation[ 1 ] = entityTranslation[ 1 ]
					
					if ( cameraMovement.obeyMinMax === true ) {
						var minX = cameraMovement.minX,
							maxX = cameraMovement.maxX,
							minY = cameraMovement.minY,
							maxY = cameraMovement.maxY
							
	 					if ( cameraTranslation[ 0 ] < minX ) {
					    	cameraTranslation[ 0 ] = minX
					    }
					    
					    if ( cameraTranslation[ 0 ] > maxX ) {
					    	cameraTranslation[ 0 ] = maxX
					    }
					    
					    if ( cameraTranslation[ 1 ] < minY ) {
					    	cameraTranslation[ 1 ] = minY
					    }
					    
					    if ( cameraTranslation[ 1 ] > maxY ) {
					    	cameraTranslation[ 1 ] = maxY
					    }						
					}
				}
			}
		}

		return cameraMover
	}
)

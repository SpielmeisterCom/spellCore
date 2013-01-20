define(
	'spell/system/processPointerInput',
	[
		'spell/math/util',

		'spell/functions'
	],
	function(
		mathUtil,

		_
	) {
		'use strict'

		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var processPointerInput = function( spell ) {

		}

		var isPointWithinEntity = function ( entityDimensions, transform, worldPosition ) {
			return mathUtil.isPointInRect(
				worldPosition,
				transform.worldTranslation,
				entityDimensions[ 0 ],
				entityDimensions[ 1 ],
				transform.rotation //TODO: should be worldRotation
			)
		}

		var processEvent = function( entityManager, pointedEntityMap, renderingContext, eventHandlers, transforms, inputEvent ) {
			if( inputEvent.type !== 'pointerDown' &&
				inputEvent.type !== 'pointerMove' &&
				inputEvent.type !== 'pointerUp' &&
				inputEvent.type !== 'pointerCancel') {

				return
			}

            var cursorWorldPosition = renderingContext.transformScreenToWorld( inputEvent.position )

            //TODO: only check visible objects
            for( var entityId in eventHandlers ) {
                var transform = transforms[ entityId ]

                if( !transform ) {
                    continue
                }

				if( pointedEntityMap[ entityId ] === undefined ) {
					pointedEntityMap[ entityId ] = false
				}

                if( inputEvent.type === 'pointerCancel' && pointedEntityMap[ entityId ] === inputEvent.pointerId ) {
                    entityManager.triggerEvent( entityId, 'pointerCancel' )
                    entityManager.triggerEvent( entityId, 'pointerUp' )
                    entityManager.triggerEvent( entityId, 'pointerOut' )
                    pointedEntityMap[ entityId ] = false

                    continue
                }

				var entityDimensions = entityManager.getEntityDimensions( entityId )

				if( entityDimensions &&
					isPointWithinEntity( entityDimensions, transform, cursorWorldPosition ) ) {

                    if( pointedEntityMap[ entityId ] === false ) {
                        entityManager.triggerEvent( entityId, 'pointerOver' )
                    }

                    if( inputEvent.type === 'pointerUp' ) {
                        pointedEntityMap[ entityId ] = false
                        entityManager.triggerEvent( entityId, 'pointerUp' )

                        //TODO: only fire pointerOut for devices that don't support hover status
                        entityManager.triggerEvent( entityId, 'pointerOut' )


                    } else if( inputEvent.type === 'pointerDown') {
                        pointedEntityMap[ entityId ] = inputEvent.pointerId
                        entityManager.triggerEvent( entityId, 'pointerDown' )

					} else if ( inputEvent.type === 'pointerMove' ) {
                        pointedEntityMap[ entityId ] = inputEvent.pointerId
                        entityManager.triggerEvent( entityId, 'pointerMove' )
					}


				} else {
                    if( pointedEntityMap[ entityId ] === inputEvent.pointerId ) {
                        //pointer moved out of the entity
						pointedEntityMap[ entityId ] = false
						entityManager.triggerEvent( entityId, 'pointerOut' )
					}
				}
			}
		}

		processPointerInput.prototype = {
			/**
		 	 * Gets called when the system is created.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
				/**
				 * Holds a map entityId => Boolean whether an entity is currently pointed to or not
				 * @type {Object}
				 */
				this.pointedEntityMap = {}
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
				var entityManager    = spell.entityManager,
					inputEvents      = spell.inputManager.getInputEvents(),
					pointedEntityMap = this.pointedEntityMap,
					renderingContext = spell.renderingContext,
					transforms       = this.transforms,
                    eventHandlers    = this.eventHandlers

				for( var i = 0, numInputEvents = inputEvents.length; i < numInputEvents; i++ ) {
					processEvent( entityManager, pointedEntityMap, renderingContext, eventHandlers, transforms, inputEvents[ i ] )
				}
			}
		}

		return processPointerInput
	}
)

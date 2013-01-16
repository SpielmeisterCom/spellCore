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

		var registeredEventHandlerMap = {}

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

		var processEvent = function( entityManager, pointedEntityMap, renderingContext, transforms, inputEvent ) {
			if( inputEvent.type !== 'pointerDown' &&
				inputEvent.type !== 'pointerMove' &&
				inputEvent.type !== 'pointerUp' &&
				inputEvent.type !== 'pointerCancel') {

				return
			}

			var cursorWorldPosition = renderingContext.transformScreenToWorld( inputEvent.position )

            for( var entityId in transforms ) {
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
					isPointWithinEntity( entityDimensions, transforms[ entityId ], cursorWorldPosition ) ) {

					if( inputEvent.type === 'pointerDown') {
						entityManager.triggerEvent( entityId, 'pointerDown' )

					} else if( inputEvent.type === 'pointerUp' || inputEvent.type === 'pointerCancel' ) {
						entityManager.triggerEvent( entityId, 'pointerUp' )

                        if( pointedEntityMap[ entityId ] !== false ) {
                            entityManager.triggerEvent( entityId, 'pointerOut' )
                            pointedEntityMap[ entityId ] = false
                        }

					} else if ( inputEvent.type === 'pointerMove' ) {
						entityManager.triggerEvent( entityId, 'pointerMove' )
					}

					if( pointedEntityMap[ entityId ] === false ) {
						pointedEntityMap[ entityId ] = inputEvent.pointerId
						entityManager.triggerEvent( entityId, 'pointerOver' )
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
					transforms       = this.transforms

				for( var i = 0, numInputEvents = inputEvents.length; i < numInputEvents; i++ ) {
					processEvent( entityManager, pointedEntityMap, renderingContext, transforms, inputEvents[ i ] )
				}
			}
		}

		return processPointerInput
	}
)

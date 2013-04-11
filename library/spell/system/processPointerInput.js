define(
	'spell/system/processPointerInput',
	[
		'spell/Defines',
		'spell/Events',
		'spell/client/util/createComprisedRectangle',
		'spell/math/util',
		'spell/math/vec2',

		'spell/functions'
	],
	function(
		Defines,
		Events,
		createComprisedRectangle,
		mathUtil,
		vec2,

		_
	) {
		'use strict'


		var currentCameraId

		var isPointWithinEntity = function ( entityDimensions, transform, worldPosition ) {
			return mathUtil.isPointInRect(
				worldPosition,
				transform.worldTranslation,
				entityDimensions[ 0 ],
				entityDimensions[ 1 ],
				transform.rotation // TODO: should be worldRotation
			)
		}

		var transformScreenToUI = function( screenSize, effectiveCameraDimensions, cursorPosition ) {
			return [
				( cursorPosition[ 0 ] / screenSize[ 0 ] - 0.5 ) * effectiveCameraDimensions[ 0 ],
				( cursorPosition[ 1 ] / screenSize[ 1 ] - 0.5 ) * -effectiveCameraDimensions[ 1 ]
			]
		}

		var processEvent = function( entityManager, screenSize, effectiveCameraDimensions, pointedEntityMap, renderingContext, eventHandlers, transforms, visualObjects, inputEvent ) {
			if( inputEvent.type !== 'pointerDown' &&
				inputEvent.type !== 'pointerMove' &&
				inputEvent.type !== 'pointerUp' &&
				inputEvent.type !== 'pointerCancel' ) {

				return
			}

			var cursorScreenPosition = inputEvent.position,
            	cursorWorldPosition  = renderingContext.transformScreenToWorld( cursorScreenPosition ),
				cursorUIPosition     = transformScreenToUI( screenSize, effectiveCameraDimensions, cursorScreenPosition )

            // TODO: only check visible objects
            for( var entityId in eventHandlers ) {
                var transform    = transforms[ entityId ],
					visualObject = visualObjects[ entityId ]

                if( !transform ||
					!visualObject ) {

                    continue
                }

				var isInUIPass = visualObject.pass === 'ui'

				if( pointedEntityMap[ entityId ] === undefined ) {
					pointedEntityMap[ entityId ] = false
				}

                if( inputEvent.type === 'pointerCancel' &&
					pointedEntityMap[ entityId ] === inputEvent.pointerId ) {

                    entityManager.triggerEvent( entityId, 'pointerCancel' )
                    entityManager.triggerEvent( entityId, 'pointerUp' )
                    entityManager.triggerEvent( entityId, 'pointerOut' )
                    pointedEntityMap[ entityId ] = false

                    continue
                }

				var entityDimensions = entityManager.getEntityDimensions( entityId )

				var isEntityHit = isPointWithinEntity(
					entityDimensions,
					transform,
					isInUIPass ? cursorUIPosition : cursorWorldPosition
				)

				if( entityDimensions &&
					isEntityHit ) {

                    if( pointedEntityMap[ entityId ] === false ) {
                        entityManager.triggerEvent( entityId, 'pointerOver' )
                    }

                    if( inputEvent.type === 'pointerUp' ) {
                        pointedEntityMap[ entityId ] = false
                        entityManager.triggerEvent( entityId, 'pointerUp' )

                        // TODO: only fire pointerOut for devices that don't support hover status
                        entityManager.triggerEvent( entityId, 'pointerOut' )


                    } else if( inputEvent.type === 'pointerDown' ) {
                        pointedEntityMap[ entityId ] = inputEvent.pointerId
                        entityManager.triggerEvent( entityId, 'pointerDown' )

					} else if( inputEvent.type === 'pointerMove' ) {
                        pointedEntityMap[ entityId ] = inputEvent.pointerId
                        entityManager.triggerEvent( entityId, 'pointerMove' )
					}

				} else if( pointedEntityMap[ entityId ] === inputEvent.pointerId ) {
					// pointer moved out of the entity
					pointedEntityMap[ entityId ] = false
					entityManager.triggerEvent( entityId, 'pointerOut' )
				}
			}
		}


		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var processPointerInput = function( spell ) {
			this.screenSize           = spell.configurationManager.getValue( 'currentScreenSize' )
			this.screenResizeHandler
			this.cameraChangedHandler
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


				var eventManager = spell.eventManager

				this.cameraChangedHandler = _.bind(
					function( camera, entityId ) {
						currentCameraId = camera.active ? entityId : undefined
					},
					this
				)

				eventManager.subscribe( [ Events.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )
				eventManager.subscribe( [ Events.COMPONENT_UPDATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )


				this.screenResizeHandler = _.bind(
					function( size ) {
						this.screenSize = size
					},
					this
				)

				eventManager.subscribe( Events.SCREEN_RESIZE, this.screenResizeHandler )
			},

			/**
		 	 * Gets called when the system is destroyed.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			destroy: function( spell ) {
				var eventManager = spell.eventManager

				eventManager.unsubscribe( [ Events.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )
				eventManager.unsubscribe( [ Events.COMPONENT_UPDATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )
				eventManager.unsubscribe( Events.SCREEN_RESIZE, this.screenResizeHandler )
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
                    eventHandlers    = this.eventHandlers,
					visualObjects    = this.visualObjects,
					camera           = this.cameras[ currentCameraId ],
					cameraTransform  = this.transforms[ currentCameraId ],
					screenSize       = this.screenSize

				var aspectRatio = screenSize[ 0 ] / screenSize[ 1 ]

				var effectiveCameraDimensions = vec2.multiply(
					cameraTransform.scale,
					createComprisedRectangle( [ camera.width, camera.height ] , aspectRatio )
				)

				for( var i = 0, numInputEvents = inputEvents.length; i < numInputEvents; i++ ) {
					processEvent( entityManager, screenSize, effectiveCameraDimensions, pointedEntityMap, renderingContext, eventHandlers, transforms, visualObjects, inputEvents[ i ] )
				}
			}
		}

		return processPointerInput
	}
)

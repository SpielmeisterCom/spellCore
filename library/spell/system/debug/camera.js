/**
 * @class spell.system.debug.camera
 * @singleton
 */

define(
	'spell/system/debug/camera',
	[
		'spell/math/vec2',
		'spell/math/mat3',
		'spell/functions'
	],
	function(
		vec2,
		mat3,
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

		var isPointInRect = function( point, rectOrigin, rectWidth, rectHeight, rectRotation ) {
			var tmp     = -rectRotation, /** Math.PI / 180,*/
				c       = Math.cos( tmp ),
				s       = Math.sin( tmp),
				leftX   = rectOrigin[ 0 ] - rectWidth / 2,
				rightX  = rectOrigin[ 0 ] + rectWidth / 2,
				topY    = rectOrigin[ 1 ] - rectHeight / 2,
				bottomY = rectOrigin[ 1 ] + rectHeight / 2

			// Unrotate the point depending on the rotation of the rectangle
			var rotatedX = rectOrigin[ 0 ] + c * ( point[ 0 ] - rectOrigin[ 0 ] ) - s * ( point[ 1 ] - rectOrigin[1] ),
				rotatedY = rectOrigin[ 1 ] + s * ( point[ 0 ] - rectOrigin[ 0 ] ) + c * ( point[ 1 ] - rectOrigin[1] )

			return leftX <= rotatedX && rotatedX <= rightX && topY <= rotatedY && rotatedY <= bottomY
		}

		var calculateOutlineBoxDimensions = function( entityId ) {
			var width = 0,
				height = 0

			if ( this.appearances[ entityId ] &&
				this.appearances[ entityId ].asset &&
				this.appearances[ entityId ].asset.resource &&
			    this.appearances[ entityId ].asset.resource.dimensions ) {

			    //entity has a static appearance
				width = this.appearances[ entityId ].asset.resource.dimensions[ 0 ]
				height = this.appearances[ entityId ].asset.resource.dimensions[ 1 ]



			} else if ( this.animatedAppearances[ entityId ] &&
				this.animatedAppearances[ entityId ].asset &&
				this.animatedAppearances[ entityId ].asset.frameDimensions ) {

				//entity has an animated appearance
				width = this.animatedAppearances[ entityId ].asset.frameDimensions[ 0 ],
				height = this.animatedAppearances[ entityId ].asset.frameDimensions[ 1 ]

			}

			//camera, physics only entites?

			//apply scale factor
			if ( this.transforms[ entityId ] ) {
				width *= Math.abs( this.transforms[ entityId ].worldScale[ 0 ] )
				height *= Math.abs( this.transforms[ entityId ].worldScale[ 1 ] )
			}

			return [ width, height ]
		}

		var findEntitiesAtPosition = function( worldPosition ) {
			var spell           = this.spell,
				ctx             = this.spell.renderingContext,
				entityManager   = this.spell.entityManager,
				me    = this

			this.matchedEntities.length = 0
			_.each(

				this.transforms,
				function( transform, id ) {

					var entityDimensions = calculateOutlineBoxDimensions.call( me, id )

					if( isPointInRect( worldPosition, transform.worldTranslation, entityDimensions[ 0 ], entityDimensions[ 1 ], transform.worldRotation ) ) {

						me.matchedEntities.push( id )

						if ( me.dragMode === me.DRAG_MODE_NONE ) {
							//only set new selectedEntity if no drag is going on
							me.selectedEntity = id
						}

						if( me.overlayEntityMap[ id ] ) {
							//update transform?

							spell.entityManager.updateComponent( me.overlayEntityMap[ id ], 'spell.component.2d.transform', {
								'translation': transform.worldTranslation
							})

							spell.entityManager.updateComponent( me.overlayEntityMap[ id ], 'spell.component.2d.graphics.debug.box', {
								'color': [1, 0, 1],
								'height': entityDimensions[ 1 ],
								'width': entityDimensions[ 0 ]
							})


						} else {
							var overlayEntityId = spell.entityManager.createEntity({
								'config': {
									'spell.component.2d.transform': {
										'translation': transform.worldTranslation
									},
									'spell.component.2d.graphics.textAppearance': {
										'text': (me.names[ id ]) ? me.names[ id ].value : id
									},
									'spell.component.visualObject': {
										'layer': 99999999
									},
									'spell.component.2d.graphics.debug.box': {}
								}
							})

							me.overlayEntityMap[ id ] = overlayEntityId
						}

					} else {
						//entity is not hit, so remove any overlay entities

						if( me.overlayEntityMap[ id ] ) {
							spell.entityManager.removeEntity( me.overlayEntityMap[ id ] )
							delete me.overlayEntityMap[ id ]
						}
					}
				}
			)


			//highlight current active entity
			spell.entityManager.updateComponent( this.overlayEntityMap[ this.selectedEntity ], 'spell.component.2d.graphics.debug.box', {
				'color': [ 1, 0, 0 ]
			})
		}

		var processEvent = function ( spell, event ) {

			if ( event.type == 'mousewheel' ) {
				//zoom camera in and out on mousewheel event
				var currentScale = this.transforms[ this.editorCameraEntityId ].scale

				currentScale[0] = currentScale[0] + ( 0.5 * event.direction * -1 )
				currentScale[1] = currentScale[1] + ( 0.5 * event.direction * -1 )

				if (currentScale[0] < 0.25) {
					currentScale[0] = 0.25
				}

				if (currentScale[1] < 0.25) {
					currentScale[1] = 0.25
				}

			} else if ( event.type == 'mousemove' ) {
				this.currentWorldPosition = spell.renderingContext.transformScreenToWorld( event.position )

				if ( this.dragMode === this.DRAG_MODE_CAMERA_MOVE  ) {
					var currentTranslation = this.transforms[ this.editorCameraEntityId ].translation,
						currentScale = this.transforms[ this.editorCameraEntityId ].scale

					if ( this.lastMousePosition === null ) {
						//first sample of mouse movement
						this.lastMousePosition = [ event.position[ 0 ], event.position[ 1 ] ]
						return
					}

					currentTranslation[ 0 ] -= ( event.position[ 0 ] - this.lastMousePosition[ 0 ] ) * currentScale[ 0 ]
					currentTranslation[ 1 ] += ( event.position[ 1 ] - this.lastMousePosition[ 1 ] ) * currentScale[ 1 ]

				} else if ( this.dragMode === this.DRAG_MODE_ENTITY_MOVE && this.selectedEntity ) {

					var currentTranslation = this.transforms[ this.selectedEntity ].translation,
						currentScale = this.transforms[ this.editorCameraEntityId ].scale

					if ( this.lastMousePosition === null ) {
						//first sample of mouse movement
						this.lastMousePosition = [ event.position[ 0 ], event.position[ 1 ] ]
						return
					}

					var newTransformConfig = {
						translation: [
							currentTranslation[ 0 ] + ( event.position[ 0 ] - this.lastMousePosition[ 0 ] ) * currentScale[ 0 ],
							currentTranslation[ 1 ] - ( event.position[ 1 ] - this.lastMousePosition[ 1 ] ) * currentScale[ 1 ]
						]
					}

					spell.entityManager.updateComponent(
						this.selectedEntity,
						'spell.component.2d.transform',
						newTransformConfig
					)

					spell.sendMessageToEditor(
						'spelled.entity.update',
						{
							id: this.selectedEntity,
							componentId: 'spell.component.2d.transform',
							config: newTransformConfig
						}
					)



				}

				this.lastMousePosition = [ event.position[ 0 ], event.position[ 1 ] ]

			} else if ( event.type == 'mousedown' ) {
				this.lastMousePosition  = null

				if ( event.button == 0 ) {
					this.dragMode       = this.DRAG_MODE_ENTITY_MOVE

				} else if ( event.button == 2 ) {
					this.dragMode       = this.DRAG_MODE_CAMERA_MOVE
				}


			} else if ( event.type == 'mouseup' ) {
				this.lastMousePosition  = null
				this.dragMode           = this.DRAG_MODE_NONE
				this.selectedEntity     = null
			}
		}

		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var camera = function( spell ) {
			this.DRAG_MODE_CAMERA_MOVE      =   'DRAG_MODE_CAMERA_MOVE'
			this.DRAG_MODE_ENTITY_MOVE      =   'DRAG_MODE_ENTITY_MOVE'
			this.DRAG_MODE_NONE             =   'DRAG_MODE_NONE'

			this.spell                  = spell
			this.lastMousePosition      = null
			this.currentWorldPosition   = null


			/**
			 * Current state of the drag mode (one of the DRAG_MODE_* constants)
			 * @type {string}
			 */
			this.dragMode                 = this.DRAG_MODE_NONE

			/**
			 * Map entity => corresponding overlay entity
			 * @type {Object}
			 */
			this.overlayEntityMap         = {}

			/**
			 * id of the currently selected entity
			 * @type {string}
			 */
			this.selectedEntity           = null

			/**
			 * List of entities which match for the current cursor (through all layers)
			 * @type {Array}
			 */
			this.matchedEntities          = []
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
				var lastActiveCameraTransform,
					lastActiveCamera

				//find current active camera
				this.lastActiveCameraId = getActiveCameraId( this.cameras )

				if ( this.lastActiveCameraId ) {
					spell.entityManager.updateComponent(
						this.lastActiveCameraId,
						'spell.component.2d.graphics.camera', {
							'active': false
						})


					lastActiveCameraTransform = this.transforms[ this.lastActiveCameraId ]
					lastActiveCamera          = this.cameras[ this.lastActiveCameraId ]

				} else {
					//no active camera found, so initalize a new one
					lastActiveCamera = {
						'width':        768,
						'height':       1024
					}

					lastActiveCameraTransform = {
						'translation':  [ 0, 0 ],
						'scale':        [ 1, 1 ],
						'rotation':     0
					}
				}

				//create editor camera
				this.editorCameraEntityId = spell.entityManager.createEntity({
					templateId: 'spell.entity.2d.graphics.camera',
					config: {
						'spell.component.2d.transform': {
							'translation': [ lastActiveCameraTransform[ 'translation' ][0], lastActiveCameraTransform[ 'translation' ][1] ],
							'scale': [ lastActiveCameraTransform[ 'scale' ][0], lastActiveCameraTransform[ 'scale' ][1] ]
						},
						'spell.component.2d.graphics.camera': {
							'active': true,
							'clearUnsafeArea': false,
							'height': lastActiveCamera[ 'height' ],
							'width': lastActiveCamera[ 'width' ]
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

				//restore last active camera
				spell.entityManager.updateComponent( this.lastActiveCameraId, 'spell.component.2d.graphics.camera', {
					'active': true
				})

				spell.entityManager.removeEntity( this.editorCameraEntityId )
				this.editorCameraEntityId = undefined

				//remove all overlay entities
				for ( var entityId in this.overlayEntityMap ) {
					spell.entityManager.removeEntity( this.overlayEntityMap[ entityId ] )
					delete this.overlayEntityMap[ entityId ]
				}
			},

			/**
			 * Gets called to trigger the processing of game state.
			 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {
				var inputEvents      = spell.inputManager.getInputEvents()
				for( var i = 0, numInputEvents = inputEvents.length; i < numInputEvents; i++ ) {

					processEvent.call( this, spell, inputEvents[ i ] )

				}

				if( this.currentWorldPosition ) {
					findEntitiesAtPosition.call( this, this.currentWorldPosition )
				}
			}
		}

		return camera
	}
)

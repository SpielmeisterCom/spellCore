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

		var findEntitiesAtPosition = function( worldPosition ) {
			var context = this.spell.renderingContext

			// TODO: corect handling of sub entities
			_.each(
				this.transforms,
				function( transform ) {

					if( isPointInRect( worldPosition, transform.translation, 100, 100, transform.rotation ) ) {
						context.save()
						context.translate( transform.translation )
						context.rotate( transform.rotation )

						context.setLineColor( [ 1, 0, 0, 1 ] )
						context.drawRect( 0, 0, 100, 100, 1 )
						context.restore()
					}
				}
			)
		}

		var processEvent = function( spell, event ) {
			if( event.type === 'mousewheel' ) {
				// zoom camera in and out on mousewheel event
				var currentScale = this.transforms[ this.editorCameraEntityId ].scale

				currentScale[ 0 ] = currentScale[ 0 ] + ( 0.75 * event.direction * -1 )
				currentScale[ 1 ] = currentScale[ 1 ] + ( 0.75 * event.direction * -1 )

				if( currentScale[ 0 ] < 0.5 ) {
					currentScale[ 0 ] = 0.5
				}

				if( currentScale[ 1 ] < 0.5 ) {
					currentScale[ 1 ] = 0.5
				}

			} else if( event.type === 'mousemove' ) {
				if( window !== undefined ) {
					window.focus()
				}

				this.currentWorldPosition = spell.renderingContext.transformScreenToWorld( event.position )

				if( this.draggingEnabled ) {
					var currentTranslation = this.transforms[ this.editorCameraEntityId ].translation,
						currentScale       = this.transforms[ this.editorCameraEntityId ].scale

					if( this.lastMousePosition === null ) {
						// first sample of mouse movement
						this.lastMousePosition = [ event.position[ 0 ], event.position[ 1 ] ]
						return
					}

					currentTranslation[ 0 ] -= ( event.position[ 0 ] - this.lastMousePosition[ 0 ] ) * currentScale[ 0 ]
					currentTranslation[ 1 ] += ( event.position[ 1 ] - this.lastMousePosition[ 1 ] ) * currentScale[ 1 ]
				}

				this.lastMousePosition = [ event.position[ 0 ], event.position[ 1 ] ]

			} else if( event.type === 'mousedown' ) {
				this.lastMousePosition = null
				this.draggingEnabled   = true

			} else if( event.type === 'mouseup' ) {
				this.lastMousePosition = null
				this.draggingEnabled   = false
			}
		}

		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var camera = function( spell ) {
			this.spell                = spell
			this.lastMousePosition    = null
			this.currentWorldPosition = null
			this.draggingEnabled      = false
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

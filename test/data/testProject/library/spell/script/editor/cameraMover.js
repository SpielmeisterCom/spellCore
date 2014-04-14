define(
	'spell/script/editor/cameraMover',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var MIN_SCALE = 0.01

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

		var cameraMover = function(spell, editorSystem) {

			/**
			 * Specifies whether we're in drag mode or not
			 * @type {Boolean}
			 */
			this.dragEnabled = false
			this.lastMousePosition = null

			this.lastActiveCameraId = null

			this.editorCameraEntityId = null
		}

		cameraMover.prototype = {

			init: function( spell, editorSystem ) {

			},

			activate: function( spell, editorSystem ) {
				var lastActiveCameraTransform,
					lastActiveCamera

				//find current active camera
				this.lastActiveCameraId = getActiveCameraId( editorSystem.cameras )

				if ( this.lastActiveCameraId ) {
					spell.entityManager.updateComponent(
						this.lastActiveCameraId,
						'spell.component.2d.graphics.camera', {
							'active': false
						})


					lastActiveCameraTransform = editorSystem.transforms[ this.lastActiveCameraId ]
					lastActiveCamera          = editorSystem.cameras[ this.lastActiveCameraId ]

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

			deactivate: function( spell, editorSystem ) {
				//restore last active camera
				spell.entityManager.updateComponent( this.lastActiveCameraId, 'spell.component.2d.graphics.camera', {
					'active': true
				})

				spell.entityManager.removeEntity( this.editorCameraEntityId )
				this.editorCameraEntityId = undefined
			},

			process: function ( spell, editorSystem, timeInMs, deltaTimeInMs) {

			},

			pointerDown: function( spell, editorSystem, event ) {
				//clear last mouse position
				this.lastMousePosition  = null

				if ( event.button == 2 ) {
					this.dragEnabled = true
				}
			},

			pointerUp: function( spell, editorSystem, event ) {
				this.lastMousePosition  = null

				if ( event.button == 2 ) {
					this.dragEnabled = false
				}
			},

			mouseWheel: function( spell, editorSystem, event ) {
				//zoom camera in and out on mousewheel event
				var currentScale = editorSystem.transforms[ this.editorCameraEntityId ].scale

				currentScale[ 0 ] = Math.max( currentScale[ 0 ] + event.direction * -0.5, MIN_SCALE )
				currentScale[ 1 ] = Math.max( currentScale[ 1 ] + event.direction * -0.5, MIN_SCALE )
			},

			pointerMove: function( spell, editorSystem, event ) {
				if ( !this.dragEnabled ) {
					return
				}

				if ( this.lastMousePosition === null ) {
					//first sample of mouse movement, save it and wait for the next one
					//to find out the movement direction
					this.lastMousePosition = [ event.position[ 0 ], event.position[ 1 ] ]
					return
				}

				var currentTranslation = editorSystem.transforms[ this.editorCameraEntityId ].translation,
					currentScale = editorSystem.transforms[ this.editorCameraEntityId ].scale

				currentTranslation[ 0 ] -= ( event.position[ 0 ] - this.lastMousePosition[ 0 ] ) * currentScale[ 0 ] * 0.5
				currentTranslation[ 1 ] += ( event.position[ 1 ] - this.lastMousePosition[ 1 ] ) * currentScale[ 1 ] * 0.5

				this.lastMousePosition = [ event.position[ 0 ], event.position[ 1 ] ]
			}
		}

		return cameraMover

})

/**
 * Determines which entities' bounds are currently intersected or contained by the view frustum defined by the
 * currently active camera.
 *
 * @class spell.visibilityManager
 * @singleton
 */
define(
	'spell/VisibilityManager',
	[
		'spell/client/util/createEffectiveCameraDimensions',
		'spell/Defines',
		'spell/math/vec2',
		'spell/functions'
	],
	function(
		createEffectiveCameraDimensions,
		Defines,
		vec2,
		_
	) {
		'use strict'

		var VisibilityManager = function( eventManager, configurationManager, entityManager ) {
			this.configurationManager       = configurationManager
			this.eventManager               = eventManager
			this.entityManager              = entityManager


			this.uiPassEntities             = {}
			this.backgroundPassEntities     = {}

			this.currentCameraId            = undefined
			this.screenSize                 = undefined

			// callback handler for event handling
			this.screenResizeHandler        = undefined
			this.cameraChangedHandler       = undefined
			this.visualObjectCreatedHandler = undefined

		}

		var registerScreenSizeHandler = function() {
			this.screenResizeHandler = _.bind(function( size ) {
				this.screenSize = size
			}, this)

			this.screenSize = this.configurationManager.getValue( 'currentScreenSize' )
			this.eventManager.subscribe(
				this.eventManager.EVENT.SCREEN_RESIZE,
				this.screenResizeHandler
			)
		}

		var unregisterScreenSizeHandler = function() {
			this.eventManager.unsubscribe(
				this.eventManager.EVENT.SCREEN_RESIZE,
				this.screenResizeHandler
			)
			this.screenSize = undefined
		}

		var registerCameraChangeHandler = function() {
			//register for camera changes
			this.cameraChangedHandler = _.bind(function( camera, entityId ) {
				this.currentCameraId = camera.active ? entityId : undefined
			}, this)

			this.eventManager.subscribe(
				[ this.eventManager.EVENT.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ],
				this.cameraChangedHandler
			)

			this.eventManager.subscribe(
				[ this.eventManager.EVENT.COMPONENT_UPDATED, Defines.CAMERA_COMPONENT_ID ],
				this.cameraChangedHandler
			)
		}

		var unregisterCameraChangeHandler = function() {
			this.eventManager.unsubscribe(
				[
					this.eventManager.EVENT.COMPONENT_CREATED,
					Defines.CAMERA_COMPONENT_ID
				],
				this.cameraChangedHandler
			)

			this.eventManager.unsubscribe(
				[
					this.eventManager.EVENT.COMPONENT_UPDATED,
					Defines.CAMERA_COMPONENT_ID
				],
				this.cameraChangedHandler
			)
			this.currentCameraId = undefined
		}

		var registerVisualObjectChangeHandler = function() {
			this.visualObjectCreatedHandler = _.bind(
				function( entityId, entity ) {
					var visualObject = entity[ Defines.VISUAL_OBJECT_COMPONENT_ID ]

					if( !visualObject ||
						visualObject.pass === 'world' ) {

						return
					}

					var compositeComponent = entity[ Defines.COMPOSITE_COMPONENT_ID ]

					var entityInfo = {
						children : compositeComponent.childrenIds,
						layer : visualObject.layer,
						id : entityId,
						parent : compositeComponent.parentId
					}

					if( visualObject.pass === 'ui' ) {
						this.uiPassEntities[ entityId ] = entityInfo

					} else if( visualObject.pass === 'background' ) {
						this.backgroundPassEntities[ entityId ] = entityInfo
					}
				},
				this
			)

			this.eventManager.subscribe(
				[ this.eventManager.EVENT.ENTITY_CREATED, Defines.VISUAL_OBJECT_COMPONENT_ID ],
				this.visualObjectCreatedHandler
			)
		}

		var unregisterVisualObjectChangeHandler = function() {
			this.eventManager.unsubscribe(
				[
					this.eventManager.EVENT.ENTITY_CREATED,
					Defines.VISUAL_OBJECT_COMPONENT_ID
				],
				this.visualObjectCreatedHandler
			)
		}

		var init = function() {
			registerScreenSizeHandler.call( this )
			registerCameraChangeHandler.call( this )
			registerVisualObjectChangeHandler.call( this )
		}

		var destroy = function( spell ) {
			unregisterScreenSizeHandler.call( this )
			unregisterCameraChangeHandler.call( this )
			unregisterVisualObjectChangeHandler.call( this )
		}

		var updateVisibility = function( spell ) {
			var currentCameraId = this.currentCameraId,
				camera          = this.entityManager.getComponentById( currentCameraId, Defines.CAMERA_COMPONENT_ID),
				transform       = this.entityManager.getComponentById( currentCameraId, Defines.TRANSFORM_COMPONENT_ID )

			if( !camera || !transform ) {
				return
			}

			var screenSize                = this.screenSize,
				aspectRatio               = screenSize[ 0 ] / screenSize[ 1 ],
				effectiveCameraDimensions = createEffectiveCameraDimensions( camera.width, camera.height, transform.scale, aspectRatio )

			spell.worldPassEntities = spell.entityManager.getEntityIdsByRegion( transform.translation, effectiveCameraDimensions )
			spell.uiPassEntities = this.uiPassEntities
			spell.backgroundPassEntities = this.backgroundPassEntities
		}


		VisibilityManager.prototype = {
			init:               init,
			destroy:            destroy,
			updateVisibility:   updateVisibility
		}

		return VisibilityManager
	}
)
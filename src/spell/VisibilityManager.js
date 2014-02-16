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
		'spell/data/spatial/BoxTree',
		'spell/client/util/createEffectiveCameraDimensions',
		'spell/Defines',
		'spell/math/vec2',
		'spell/functions'
	],
	function(
		BoxTree,
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

			this.boxtree                    = undefined

			this.currentCameraId            = undefined
			this.screenSize                 = undefined

			// callback handler for event handling
			this.screenResizeHandler        = undefined
			this.cameraChangeHandler        = undefined
			this.componentChangeHandler     = undefined
			this.entityChangeHandler        = undefined

		}

		var entityIdsToBoxTreeNode = {}

		var updateEntity = function( entityId ) {
			var boxtree             = this.boxtree,
				entityManager       = this.entityManager,
				componentMaps       = entityManager.componentMaps,
				transforms          = componentMaps[ Defines.TRANSFORM_COMPONENT_ID ],
				visualObjects       = componentMaps[ Defines.VISUAL_OBJECT_COMPONENT_ID ],
				composites          = componentMaps[ Defines.COMPOSITE_COMPONENT_ID ],
				transform           = transforms ? transforms[ entityId ] : undefined,
				visualObject        = visualObjects ? visualObjects[ entityId ] : undefined,
				compositeComponent  = composites ? composites[ entityId ] : undefined,
				childrenIds         = compositeComponent ? compositeComponent.childrenIds : []


			if( !transform || !visualObject ) {
				// make sure that entities without a visual reprentation are removed from the boxtree
				if( entityIdsToBoxTreeNode[ entityId ] ) {
					boxtree.remove( entityIdsToBoxTreeNode[ entityId ] )
					delete entityIdsToBoxTreeNode[ entityId ]
				}

			} else {

				var dimensions          = entityManager.getEntityDimensions( entityId ),
					vertices            = transform && dimensions ? [
						transform.worldTranslation[ 0 ] - dimensions[ 0 ] / 2,
						transform.worldTranslation[ 1 ] - dimensions[ 1 ] / 2,
						transform.worldTranslation[ 0 ] + dimensions[ 0 ] / 2,
						transform.worldTranslation[ 1 ] + dimensions[ 1 ] / 2
					] : [ 0, 0, 0, 0 ]

				var entityInfo = entityIdsToBoxTreeNode[ entityId ] || {}

				if( !entityInfo.id ) {
					entityInfo.parent    = compositeComponent.parentId
					entityInfo.children  = compositeComponent.childrenIds
					entityInfo.layer     = visualObject ? visualObject.layer : 0
					entityInfo.id        = entityId
					entityInfo.vertices  = vertices

					entityIdsToBoxTreeNode[ entityId ] = entityInfo
				}

				if( visualObject.pass === 'ui' ) {
					this.uiPassEntities[ entityId ] = entityInfo

				} else if ( visualObject.pass === 'background' ) {

					this.backgroundPassEntities[ entityId ] = entityInfo

				} else if ( visualObject.pass === 'world' ) {

					if( !entityInfo.boxTreeIndex ) {
						boxtree.add( entityInfo, entityInfo.vertices )

					} else if (
						vertices[ 0 ] != entityInfo.vertices[ 0 ] ||
						vertices[ 1 ] != entityInfo.vertices[ 1 ] ||
						vertices[ 2 ] != entityInfo.vertices[ 2 ] ||
						vertices[ 3 ] != entityInfo.vertices[ 3 ]
					) {

						boxtree.update( entityInfo, vertices )
						entityInfo.vertices  = vertices
					}
				}
			}

			_.each(
				childrenIds,
				_.bind( updateEntity, this )
			)

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
			this.cameraChangeHandler = _.bind(function( camera, entityId ) {
				this.currentCameraId = camera.active ? entityId : undefined
			}, this)

			this.eventManager.subscribe(
				[ this.eventManager.EVENT.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ],
				this.cameraChangeHandler
			)

			this.eventManager.subscribe(
				[ this.eventManager.EVENT.COMPONENT_UPDATED, Defines.CAMERA_COMPONENT_ID ],
				this.cameraChangeHandler
			)
		}

		var unregisterCameraChangeHandler = function() {
			this.eventManager.unsubscribe(
				[
					this.eventManager.EVENT.COMPONENT_CREATED,
					Defines.CAMERA_COMPONENT_ID
				],
				this.cameraChangeHandler
			)

			this.eventManager.unsubscribe(
				[
					this.eventManager.EVENT.COMPONENT_UPDATED,
					Defines.CAMERA_COMPONENT_ID
				],
				this.cameraChangeHandler
			)
			this.currentCameraId = undefined
		}

		var registerEntityHandler = function() {
			var me = this,
				eventManager = this.eventManager

			this.entityChangeHandler = _.bind(
				function( entityId, entityComponents ) {
					updateEntity.call( me, entityId )
				},
				this
			)

			_.each(
				[ eventManager.EVENT.ENTITY_CREATED, eventManager.EVENT.ENTITY_REMOVED ],
				function( event ) {
					eventManager.subscribe( event, me.entityChangeHandler )
				}
			)
		}

		var unregisterEntityHandler = function() {
			var me = this,
				eventManager = this.eventManager

			_.each(
				[ eventManager.EVENT.ENTITY_CREATED, eventManager.EVENT.ENTITY_REMOVED ],
				function( event ) {
					eventManager.unsubscribe( event, me.entityChangeHandler )
				}
			)

			me.entityChangeHandler = undefined
		}

		var registerComponentHandler = function() {
			var me = this,
				eventManager = this.eventManager

			this.componentChangeHandler = _.bind(
				function( object, entityId ) {

					if( !_.isObject( object ) ) { //removal of the component
						entityId = object
					}

					updateEntity.call( me, entityId )
				},
				this
			)

			_.each(
				[
					[ eventManager.EVENT.COMPONENT_CREATED, Defines.VISUAL_OBJECT_COMPONENT_ID ],
					[ eventManager.EVENT.COMPONENT_UPDATED, Defines.VISUAL_OBJECT_COMPONENT_ID ],
					[ eventManager.EVENT.COMPONENT_REMOVED, Defines.VISUAL_OBJECT_COMPONENT_ID ],

					[ eventManager.EVENT.COMPONENT_CREATED, Defines.TRANSFORM_COMPONENT_ID ],
					[ eventManager.EVENT.COMPONENT_UPDATED, Defines.TRANSFORM_COMPONENT_ID ],
					[ eventManager.EVENT.COMPONENT_REMOVED, Defines.TRANSFORM_COMPONENT_ID ]
				],
				function( event ) {
					eventManager.subscribe( event, me.componentChangeHandler )
				}
			)
		}

		var unregisterComponentHandler = function() {
			var me = this,
				eventManager = this.eventManager

			_.each(
				[
					[ eventManager.EVENT.COMPONENT_CREATED, Defines.VISUAL_OBJECT_COMPONENT_ID ],
					[ eventManager.EVENT.COMPONENT_UPDATED, Defines.VISUAL_OBJECT_COMPONENT_ID ],
					[ eventManager.EVENT.COMPONENT_REMOVED, Defines.VISUAL_OBJECT_COMPONENT_ID ],

					[ eventManager.EVENT.COMPONENT_CREATED, Defines.TRANSFORM_COMPONENT_ID ],
					[ eventManager.EVENT.COMPONENT_UPDATED, Defines.TRANSFORM_COMPONENT_ID ],
					[ eventManager.EVENT.COMPONENT_REMOVED, Defines.TRANSFORM_COMPONENT_ID ]
				],
				function( event ) {
					eventManager.unsubscribe( event, me.componentChangeHandler )
				}
			)

			me.componentChangeHandler = undefined
		}

		var init = function() {
			registerScreenSizeHandler.call( this )
			registerCameraChangeHandler.call( this )
			registerEntityHandler.call( this )
			registerComponentHandler.call( this )

			this.boxtree = new BoxTree.create( false )
		}

		var destroy = function( spell ) {
			unregisterScreenSizeHandler.call( this )
			unregisterCameraChangeHandler.call( this )
			unregisterEntityHandler.call( this )
			unregisterComponentHandler.call( this )
		}

		/**
		 * Returns all entities which intersect with the region defined by the position and dimension. The return
		 * value is an object with the entity ids as keys and additional entity metadata as value.
		 *
		 * @param position {Array} the position of the region in world coordinates
		 * @param dimensions {Array} the dimensions of the region in world coordinates
		 * @return {Object}
		 */
		var getEntityIdsByRegion = function( boxtree, position, dimensions ) {
			var tmp     = [],
				result  = {}

				boxtree.getOverlappingNodes(
				[
					position[0] - dimensions[0] / 2,
					position[1] - dimensions[1] / 2,
					position[0] + dimensions[0] / 2,
					position[1] + dimensions[1] / 2
				],
				tmp
			)

			//console.log( tmp.length + ' objects visible ')

			_.each(tmp, function( obj ) {
				result[ obj.id ] = obj
			})

			return result
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


			//TODO: only if boxtree was updated
			this.boxtree.finalize()

			spell.worldPassEntities = getEntityIdsByRegion.call( this, this.boxtree, transform.translation, effectiveCameraDimensions )
			spell.uiPassEntities = this.uiPassEntities
			spell.backgroundPassEntities = this.backgroundPassEntities
		}


		VisibilityManager.prototype = {
			init:               init,
			destroy:            destroy,
			updateVisibility:   updateVisibility,
			updateEntity:       updateEntity
		}

		return VisibilityManager
	}
)


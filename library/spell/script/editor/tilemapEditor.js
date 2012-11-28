define(
	'spell/script/editor/tilemapEditor',
	[
		'spell/functions'
	],
	function(_) {
		'use strict'

		var STATE_INACTIVE      = 0,
			STATE_SELECT_TILE   = 1,
			STATE_DRAW_TILE     = 2

		var tilemapEditor = function(spell, editorSystem) {
			this.state              = STATE_INACTIVE
			this.transforms         = editorSystem.transforms
			this.tilemaps           = editorSystem.tilemaps
			this.spell              = spell

			/**
			 * Entity of the tilemap that is currently being edited
			 */
			this.currentTilemap                 = null

			/**
			 * The cell the cursor is pointing to atm
			 * @type {vec2}
			 */
			this.currentOffset                  = null

			/**
			 * The currently selected frame index
			 * @type {number}
			 */
			this.currentFrameIndex              = null

			/**
			 * Mapping frameindex => entityId for the selection overlay
			 * @type {Object}
			 */
			this.tilemapSelectionMap            = {}

			/**
			 * Entity if of the entity for the background in the selection screen
			 */
			this.tilemapSelectionBackground     = null

			/**
			 * EntityId of the entity that is currently highlighted
			 */
			this.tilemapSelectionHighlighted    = null

			/**
			 * The entityId of the selection cursor
			 * @type {null}
			 */
			this.tilemapSelectionCursor         = null
		}

		//private functions
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


		var isPointWithinEntity = function ( worldPosition, entityId ) {
			var isTilemapSelectionEntity = _.contains(
				_.values( this.tilemapSelectionMap ),
				entityId
			)

			if (!isTilemapSelectionEntity) {
				//no further processing for overlay entites
				return false
			}

			var transform = this.transforms[ entityId ],
				entityDimensions = this.spell.entityManager.getEntityDimensions( entityId )

			return isPointInRect( worldPosition, transform.worldTranslation, entityDimensions[ 0 ], entityDimensions[ 1 ], transform.worldRotation )

		}

		var destroyTilemapSelectionEntities = function( exceptThisEntityId ) {
			var entityManager = this.spell.entityManager

			if( this.tilemapSelectionBackground !== null ) {
				entityManager.removeEntity( this.tilemapSelectionBackground )
				this.tilemapSelectionBackground = null
			}

			for( var frameIndex in this.tilemapSelectionMap ) {
				var entityId = this.tilemapSelectionMap[ frameIndex ]

				if( !exceptThisEntityId || exceptThisEntityId !== entityId ) {
					entityManager.removeEntity( entityId )
				}
			}
			this.tilemapSelectionMap = {}
		}

		var alignToGrid = function( entityId, worldPosition, tilemap, tilemapTransform ) {
			var entityManager       = this.spell.entityManager,
				tilemap             = this.tilemaps[ this.currentTilemap ],
				tilemapTransform    = this.transforms[ this.currentTilemap ],
				tilemapDimensions   = entityManager.getEntityDimensions( this.currentTilemap ),
				tilemapTranslation  = tilemapTransform.worldTranslation,
				frameDimensions     = tilemap.asset.spriteSheet.frameDimensions

			if(
				isPointInRect( worldPosition, tilemapTranslation, tilemapDimensions[ 0 ], tilemapDimensions[ 1 ], 0 )
			) {

				if (entityManager.hasComponent(entityId, 'spell.component.2d.graphics.shape.rectangle')) {
					entityManager.removeComponent(entityId, 'spell.component.2d.graphics.shape.rectangle')
				}

				var offsetX = Math.floor( worldPosition[0] / frameDimensions[0]),
					offsetY = Math.floor( worldPosition[1] / frameDimensions[1]),
					newX = offsetX * frameDimensions[0] + frameDimensions[0] / 2 + 3,
					newY = offsetY * frameDimensions[1] + frameDimensions[1] / 2 - 1

				this.currentOffset = [ offsetX, offsetY ]

				entityManager.updateComponent(entityId, 'spell.component.2d.transform', {
					translation: [ newX, newY ]
				})

			} else {
				//it's not placeable here
				this.currentOffset = null

				if( !entityManager.hasComponent(entityId, 'spell.component.2d.graphics.shape.rectangle') ) {

					entityManager.addComponent(entityId, 'spell.component.2d.graphics.shape.rectangle',
						{
							'lineColor': [1, 0, 0],
							'lineWidth': 3,
							'width': frameDimensions[0],
							'height': frameDimensions[1]
						})
				}

				entityManager.updateComponent(entityId, 'spell.component.2d.transform', {
					translation: worldPosition
				})

			}
		}

		var updateTilemap = function( offset, frameIndex ) {
			console.log('updating tilemap')
			console.log(offset)
			console.log(frameIndex)
		}

		var showTilemapSelector = function( cursorWorldPosition, tilemapAsset ) {
			var entityManager               = this.spell.entityManager,
				spriteSheetAssetId          = tilemapAsset.asset.spriteSheet.assetId,
				frameDimensions             = tilemapAsset.asset.spriteSheet.frameDimensions,
				numFrames                   = tilemapAsset.asset.spriteSheet.numFrames

			//present a nice quadratic selection menu for the tiles
			var framesPerRow = Math.floor( Math.sqrt(numFrames) ) + 1

			var offsetX     = cursorWorldPosition[ 0 ],
				offsetY     = cursorWorldPosition[ 1 ],
				frameWidth  = framesPerRow * frameDimensions[ 0 ],
				frameHeight = framesPerRow * frameDimensions[ 1 ]

			//draw a background for the tile selection menu
			this.tilemapSelectionBackground = entityManager.createEntity({
				'config': {
					'spell.component.2d.transform': {
						'translation': [
							offsetX + frameWidth / 2 - frameDimensions[ 0 ] / 2,
							offsetY - frameHeight / 2 + frameDimensions[ 1 ] / 2
						]
					},
					'spell.component.visualObject': {
						'opacity': 0.5,
						'layer': 99999997
					},
					'spell.component.2d.graphics.shape.rectangle': {
						'fill': true,
						'fillColor': [0.35, 0.35, 0.35],
						'lineColor': [0.1, 0.1, 0.1],
						'lineWidth': 2,
						'width': frameWidth + 5,
						'height': frameHeight + 5
					}
				}
			})

			//draw every tile of the tileset
			this.tilemapSelectionMap = {}
			for (var x=0; x<numFrames; x++) {
				this.tilemapSelectionMap[ x ] = entityManager.createEntity({
					'config': {
						'spell.component.2d.transform': {
							'translation': [ offsetX, offsetY ]
						},
						'spell.component.2d.graphics.spriteSheetAppearance': {
							'assetId': spriteSheetAssetId,
							'drawAllFrames': false,
							'frames': [ x ]
						},
						'spell.component.2d.graphics.quadGeometry': {
							'dimensions': [ frameDimensions[ 0 ], frameDimensions[ 1 ] ]
						},
						'spell.component.visualObject': {
							'layer': 99999998
						}
					}
				})

				offsetX += frameDimensions[ 0 ]

				if (x % framesPerRow === framesPerRow-1) {
					offsetY -= frameDimensions[ 1 ]
					offsetX = cursorWorldPosition[ 0 ]
				}
			}
		}

		//public functions
		tilemapEditor.prototype = {

			init: function( spell, editorSystem ) {

			},

			activate: function( spell, editorSystem ) {

			},

			deactivate: function( spell, editorSystem ) {

			},

			process: function ( spell, editorSystem, timeInMs, deltaTimeInMs) {
				var entityManager = spell.entityManager

				if( this.state === STATE_SELECT_TILE ) {
					//find all entities that match with the current cursor position
					var matchedEntities = _.filter(
						_.keys( this.transforms ),
						_.bind(
							isPointWithinEntity,
							this,
							editorSystem.cursorWorldPosition
						)
					)

					//clear all rects
					_.each( this.tilemapSelectionMap, function( entityId, frameIndex ) {
						entityManager.removeComponent( entityId, 'spell.component.2d.graphics.shape.rectangle' )
					} )

					this.tilemapSelectionHighlighted = null
					if( matchedEntities.length > 0 ) {
						this.tilemapSelectionHighlighted = matchedEntities[ 0 ]

						var frameDimensions = this.tilemaps[ this.currentTilemap ].asset.spriteSheet.frameDimensions

						if (!entityManager.hasComponent(this.tilemapSelectionHighlighted, 'spell.component.2d.graphics.shape.rectangle')) {
							entityManager.addComponent(this.tilemapSelectionHighlighted, 'spell.component.2d.graphics.shape.rectangle',
								{
									'lineColor': [0, 1, 0],
									'lineWidth': 3,
									'width': frameDimensions[0],
									'height': frameDimensions[1]
								})
						}

					}
				}

			},

			keydown: function( spell, editorSystem, event ) {
				var keyCodes        = spell.inputManager.getKeyCodes(),
					selectedEntityId  = editorSystem.selectedEntity

				if( event.keyCode === keyCodes.SPACE && selectedEntityId !== null && this.tilemaps[ selectedEntityId ] ) {

					editorSystem.prototype.acquireEventLock.call( editorSystem, this, ['mousemove', 'mousedown', 'mouseup', 'keydown', 'keyup'] )
					editorSystem.prototype.acquireProcessLock.call( editorSystem, this )

					this.currentTilemap = selectedEntityId
					this.state = STATE_SELECT_TILE

					destroyTilemapSelectionEntities.call( this )

					showTilemapSelector.call( this, editorSystem.cursorWorldPosition, this.tilemaps[ selectedEntityId ] )

				}
			},

			mousedown: function( spell, editorSystem, event ) {
				var entityManager = spell.entityManager

				if( this.state === STATE_SELECT_TILE && this.tilemapSelectionHighlighted !== null ) {

					this.tilemapSelectionCursor         = this.tilemapSelectionHighlighted
					this.tilemapSelectionHighlighted    = null

					//find the current selected frame index
					for(var frameIndex in this.tilemapSelectionMap) {
						var entityId = this.tilemapSelectionMap[ frameIndex ]

						if(entityId === this.tilemapSelectionCursor ) {
							this.currentFrameIndex = frameIndex
							break
						}
					}

					destroyTilemapSelectionEntities.call(this, this.tilemapSelectionCursor )

					entityManager.removeComponent( this.tilemapSelectionCursor, 'spell.component.2d.graphics.shape.rectangle' )

					this.state = STATE_DRAW_TILE

				} else if( this.state === STATE_DRAW_TILE && this.tilemapSelectionCursor !== null && this.currentOffset !== null ) {
					updateTilemap.call( this, this.currentOffset, this.currentFrameIndex )
				}
			},

			mouseup: function( spell, editorSystem, event ) {
			},


			mousemove: function( spell, editorSystem, event ) {
				var entityManager = spell.entityManager

				if(this.state === STATE_DRAW_TILE && this.tilemapSelectionCursor !== null && this.currentTilemap !== null) {
					alignToGrid.call(
						this,
						this.tilemapSelectionCursor,
						editorSystem.cursorWorldPosition)
				}
			}
		}

		return tilemapEditor

	})
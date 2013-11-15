define(
	'spell/script/editor/tilemapEditor',
	[
		'spell/math/vec2',
		'spell/math/mat3',
        'spell/math/util',

		'spell/functions'
	],
	function(
		vec2,
		mat3,
        mathUtil,
		_
		) {
		'use strict'

		var STATE_INACTIVE      = 0,
			STATE_SELECT_TILE   = 1,
			STATE_READY_TO_DRAW = 2,
			STATE_DRAW_TILE     = 3

        var worldToLocalMatrix = mat3.create()

        var tilemapEditor = function(spell, editorSystem) {
			this.state              = STATE_INACTIVE
			this.transforms         = editorSystem.transforms
			this.tilemaps           = editorSystem.tilemaps

			/**
			 * Reference to the spell object
			 */
			this.spell                          = spell

			/**
			 * Reference to the editorSystem
			 */
			this.editorSystem                   = editorSystem

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

		var tmpVec2 = vec2.create()

		// private functions
		var isPointWithinEntity = function ( worldPosition, entityId ) {
			var transform = this.transforms[ entityId ],
				entityDimensions = this.spell.entityManager.getEntityDimensions( entityId )

			return mathUtil.isPointInRect( worldPosition, transform.worldTranslation, entityDimensions[ 0 ], entityDimensions[ 1 ], 0 )

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

			if (this.tilemapSelectionCursor !== null && this.tilemapSelectionCursor !== exceptThisEntityId) {
				entityManager.removeEntity(this.tilemapSelectionCursor)
			}
			this.tilemapSelectionMap = {}
		}

		var alignToGrid = function( entityId, worldPosition, tilemap, tilemapTransform ) {
			var entityManager       = this.spell.entityManager,
				tilemap             = this.tilemaps[ this.currentTilemap ],
				tilemapTransform    = this.transforms[ this.currentTilemap ],
				tilemapDimensions   = entityManager.getEntityDimensions( this.currentTilemap ),
				tilemapTranslation  = tilemapTransform.worldTranslation,
				frameDimensions     = tilemap.asset.spriteSheet.frameDimensions,
				currentOffset       = null

			if(
				mathUtil.isPointInRect( worldPosition, tilemapTranslation, tilemapDimensions[ 0 ], tilemapDimensions[ 1 ], 0 )
			) {

                mat3.invert( worldToLocalMatrix, tilemapTransform.worldMatrix )

                // convert worldposition to coordinates which are local to the tilemaps origin
				vec2.transformMat3( tmpVec2, worldPosition, worldToLocalMatrix )

				if ( entityManager.hasComponent(entityId, 'spell.component.2d.graphics.shape.rectangle') ) {
					entityManager.removeComponent(entityId, 'spell.component.2d.graphics.shape.rectangle')
				}

				var offsetX         = Math.floor( tmpVec2[ 0 ] / frameDimensions[ 0 ]),
					offsetY         = Math.floor( tmpVec2[ 1 ] / frameDimensions[ 1 ]),
					currentOffset   = [ offsetX, offsetY ]

				// transform the grid aligned local coordinates to world coordinates again
				tmpVec2[ 0 ] = offsetX * frameDimensions[ 0 ] + frameDimensions[ 0 ] / 2
				tmpVec2[ 1 ] = offsetY * frameDimensions[ 1 ] + frameDimensions[ 1 ] / 2
				vec2.transformMat3( tmpVec2, tmpVec2, tilemapTransform.worldMatrix )

				entityManager.updateComponent( entityId, 'spell.component.2d.transform', {
					translation: tmpVec2
				})


			} else {
				// it's not placeable here
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

			entityManager.updateWorldTransform( entityId )

			return currentOffset
		}

		var updateTilemap = function( offset, frameIndex ) {

			var tilemap           = this.tilemaps[ this.currentTilemap ],
				asset             = tilemap.asset,
				tilemapDimensions = asset.tilemapDimensions,
				tilemapData       = asset.tilemapData,
				maxY              = parseInt(tilemapDimensions[ 1 ],10) - 1,
				normalizedOffsetX = offset[ 0 ] + Math.floor(tilemapDimensions[ 0 ] / 2),
				normalizedOffsetY = maxY - (offset[ 1 ] + Math.floor(maxY / 2) + 1)

			// make sure the tilemapData structure is initialized
			for (var y=0; y < tilemapDimensions[1].length; y++) {
				for (var x=0; x < tilemapDimensions[0].length; x++) {
					if (tilemapData[ y ][ x ] === undefined) {
						tilemapData[ y ][ x ] = null
					}
				}
			}

			if (frameIndex == 9999) {
				frameIndex = null

			} else {
				frameIndex = parseInt(frameIndex, 10)
			}

			tilemapData[ normalizedOffsetY ][ normalizedOffsetX ] = frameIndex
		}

		var sendChangedAssetDataToEditor = function() {
			var tilemap           = this.tilemaps[ this.currentTilemap ],
				asset             = tilemap.asset,
				data              = {
					id: tilemap.assetId,
					config: {
						'width':            asset.config['width'],
						'height':           asset.config['height'],
						'tileLayerData':    asset.tilemapData
					},
					assetId: asset.spriteSheet.assetId
				}

			this.spell.sendMessageToEditor(
				'spelled.debug.library.updateAsset', data
			)
		}

		/**
		 * Gets called when tile editing starts for a selectedEntity
		 */
		var beginTileEditing = function() {
			var editorSystem        = this.editorSystem,
				selectedEntityId    = editorSystem.selectedEntity

			editorSystem.prototype.deactivatePlugin.call( editorSystem, 'entityMover' )

			this.currentTilemap = selectedEntityId
			this.state          = STATE_SELECT_TILE

			destroyTilemapSelectionEntities.call( this )

			showTilemapSelector.call( this, editorSystem.cursorWorldPosition, this.tilemaps[ selectedEntityId ] )
		}

		/**
		 * Gets calles when tile editing ends for a selectedEntity
		 */
		var endTileEditing = function() {
			var editorSystem        = this.editorSystem,
				selectedEntityId    = editorSystem.selectedEntity

			this.state = STATE_INACTIVE
			destroyTilemapSelectionEntities.call( this )

			editorSystem.prototype.activatePlugin.call( editorSystem, 'entityMover' )

		}


		var showTilemapSelector = function( cursorWorldPosition, tilemapAsset ) {
			var entityManager               = this.spell.entityManager,
				spriteSheetAssetId          = tilemapAsset.asset.spriteSheet.assetId,
				frameDimensions             = tilemapAsset.asset.spriteSheet.frameDimensions,
				numFrames                   = tilemapAsset.asset.spriteSheet.frameOffsets.length + 1 // add one frame for the delete icon

			// present a nice quadratic selection menu for the tiles
			var framesPerRow = Math.floor( Math.sqrt(numFrames) )

			var offsetX     = cursorWorldPosition[ 0 ],
				offsetY     = cursorWorldPosition[ 1 ],
				frameWidth  = framesPerRow * frameDimensions[ 0 ],
				frameHeight = framesPerRow * frameDimensions[ 1 ]

			// draw a background for the tile selection menu
			this.tilemapSelectionBackground = entityManager.createEntity({
				'config': {
					'spell.component.2d.transform': {
						'translation': [
							offsetX + frameWidth / 2 - frameDimensions[ 0 ] / 2,
							offsetY - frameHeight / 2 + frameDimensions[ 1 ] / 2
						]
					},
					'spell.component.visualObject': {
						'opacity': 0.7,
						'layer': 99999997
					},
					'spell.component.2d.graphics.shape.rectangle': {
						'fill': true,
						'fillColor': [0.35, 0.35, 0.35],
						'lineColor': [0.5, 0.5, 0.5],
						'lineWidth': 3,
						'width': frameWidth + 10,
						'height': frameHeight + 10
					}
				}
			})

			// draw every tile of the tileset
			this.tilemapSelectionMap = {}
			for (var x=0; x<numFrames-1; x++) {
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
						'spell.component.2d.graphics.geometry.quad': {
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


			this.tilemapSelectionMap[9999] = entityManager.createEntity({
				'config': {
					'spell.component.2d.transform': {
						'translation': [ offsetX, offsetY ]
					},
					'spell.component.2d.graphics.appearance': {
						'assetId': 'appearance:spell.remove'
					},
					'spell.component.2d.graphics.geometry.quad': {
						'dimensions': [ frameDimensions[ 0 ], frameDimensions[ 1 ] ]
					},
					'spell.component.visualObject': {
						'layer': 99999998
					}
				}
			})

		}

		// public functions
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
					// find all entities that match with the current cursor position
					var matchedEntities = _.filter(
						_.values( this.tilemapSelectionMap ),
						_.bind(
							isPointWithinEntity,
							this,
							editorSystem.cursorWorldPosition
						)
					)

					// clear all rects
					_.each(
						this.tilemapSelectionMap,
						function( entityId, frameIndex ) {
							entityManager.removeComponent( entityId, 'spell.component.2d.graphics.shape.rectangle' )
						}
					)

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

			keyDown: function( spell, editorSystem, event ) {
				var KEY        = spell.inputManager.KEY,
					selectedEntityId  = editorSystem.selectedEntity

				if( event.keyCode === KEY.SPACE && selectedEntityId !== null && this.tilemaps[ selectedEntityId ] ) {

					beginTileEditing.call( this )

				} else if (
					event.keyCode === KEY.ESCAPE &&
					(
						this.state === STATE_SELECT_TILE ||
						this.state === STATE_READY_TO_DRAW ||
						this.state === STATE_DRAW_TILE
					)
				) {

					endTileEditing.call( this )
				}

			},

			pointerDown: function( spell, editorSystem, event ) {
				var entityManager = spell.entityManager

				if(event.button != 0) {
					// only respond to left mouseclicks
					return
				}

				if( this.state === STATE_SELECT_TILE && this.tilemapSelectionHighlighted !== null ) {

					this.tilemapSelectionCursor         = this.tilemapSelectionHighlighted
					this.tilemapSelectionHighlighted    = null

					// find the current selected frame index
					for(var frameIndex in this.tilemapSelectionMap) {
						var entityId = this.tilemapSelectionMap[ frameIndex ]

						if(entityId === this.tilemapSelectionCursor ) {
							this.currentFrameIndex = frameIndex
							break
						}
					}

					destroyTilemapSelectionEntities.call(this, this.tilemapSelectionCursor )

					entityManager.removeComponent( this.tilemapSelectionCursor, 'spell.component.2d.graphics.shape.rectangle' )

					this.state = STATE_READY_TO_DRAW

				} else if( this.state === STATE_READY_TO_DRAW && this.tilemapSelectionCursor !== null && this.currentOffset !== null ) {
					this.state = STATE_DRAW_TILE
					updateTilemap.call( this, this.currentOffset, this.currentFrameIndex )
				}
			},

			pointerUp: function( spell, editorSystem, event ) {

				if(this.state === STATE_DRAW_TILE) {
					this.currentOffset                  = null
					this.state = STATE_READY_TO_DRAW

					sendChangedAssetDataToEditor.call( this )
				}
			},


			pointerMove: function( spell, editorSystem, event ) {
				var entityManager = spell.entityManager

				if(this.state === STATE_READY_TO_DRAW && this.tilemapSelectionCursor !== null && this.currentTilemap !== null) {
					this.currentOffset = alignToGrid.call(
						this,
						this.tilemapSelectionCursor,
						editorSystem.cursorWorldPosition)
				} else if( this.state === STATE_DRAW_TILE ) {
					this.currentOffset = alignToGrid.call(
						this,
						this.tilemapSelectionCursor,
						editorSystem.cursorWorldPosition)

					if(this.tilemapSelectionCursor !== null && this.currentOffset !== null) {
						updateTilemap.call( this, this.currentOffset, this.currentFrameIndex )
					}
				}
			}
		}

		return tilemapEditor

	})

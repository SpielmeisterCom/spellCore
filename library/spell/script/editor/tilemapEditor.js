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

			//draw a nice background for the tile selection menu
			entityManager.createEntity({
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
						'lineColor': [1, 1, 1],
						'width': frameWidth + 5,
						'height': frameHeight + 5
					}
				}
			})

			for (var x=0; x<numFrames; x++) {
				entityManager.createEntity({
					'config': {
						'spell.component.2d.transform': {
							'translation': [ offsetX, offsetY ]
						},
						'spell.component.2d.graphics.spriteSheetAppearance': {
							'assetId': spriteSheetAssetId,
							'drawAllFrames': false,
							'frames': [ x ]
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

			this.tilemapSelectionCursor = entityManager.createEntity({
				'config': {
					'spell.component.2d.transform': {
						'translation': cursorWorldPosition
					},
					'spell.component.visualObject': {
						'layer': 99999999
					},
					'spell.component.2d.graphics.shape.rectangle': {
						'color': [1, 0, 1],
						'height': frameDimensions[ 1 ],
						'width': frameDimensions[ 0 ]
					}
				}
			})

		}

		var tilemapEditor = function(spell, editorSystem) {
			this.state              = STATE_INACTIVE
			this.spell              = spell

			this.tilemapSelection       = null
			this.tilemapSelectionCursor = null
		}

		tilemapEditor.prototype = {

			init: function( spell, editorSystem ) {

			},

			activate: function( spell, editorSystem ) {

			},

			deactivate: function( spell, editorSystem ) {

			},

			process: function ( spell, editorSystem, timeInMs, deltaTimeInMs) {

			},

			keydown: function( spell, editorSystem, event ) {
				var keyCodes        = spell.inputManager.getKeyCodes(),
					selectedEntity  = editorSystem.selectedEntity,
					tilemaps        = editorSystem.tilemaps,
					tilemap         = null

				if(event.keyCode === keyCodes.SPACE && selectedEntity !== null && tilemaps[ selectedEntity ]) {

					editorSystem.prototype.acquireEventLock.call( editorSystem, this, ['mousemove', 'mousedown', 'mouseup'] )
					editorSystem.prototype.acquireProcessLock.call( editorSystem, this )

					tilemap = tilemaps[ selectedEntity ]
					this.state = STATE_SELECT_TILE

					showTilemapSelector.call( this, editorSystem.cursorWorldPosition, tilemap )

				}
			},

			mousedown: function( spell, editorSystem, event ) {

				if( this.state === STATE_SELECT_TILE ) {
					console.log('mouseclick')
				}
			},

			mouseup: function( spell, editorSystem, event ) {
			},


			mousemove: function( spell, editorSystem, event ) {
			}
		}

		return tilemapEditor

	})
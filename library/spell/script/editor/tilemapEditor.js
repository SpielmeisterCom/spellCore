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
				numFrames                   = tilemapAsset.asset.spriteSheet.numFrames,
				tilemapSelectionEntityId    = null

			//present a nice quadratic selection menu for the tiles
			var framesPerRow = Math.floor( Math.sqrt(numFrames) ) + 1

			this.tilemapSelection = entityManager.createEntity({
				'config': {
					'spell.component.2d.transform': {
						'translation': cursorWorldPosition
					},
					'spell.component.2d.graphics.spriteSheetAppearance': {
						'assetId': spriteSheetAssetId
					},
					'spell.component.2d.graphics.geometry.quad': {
						dimensions: [ framesPerRow * frameDimensions[ 0 ], framesPerRow * frameDimensions[ 1 ] ]
					},
					'spell.component.visualObject': {
						'layer': 99999998
					}
				}
			})
/*
			var tilemapSelectionCursor = entityManager.createEntity({
				'config': {
					'spell.component.2d.transform': {
						'translation': cursorWorldPosition
					},
					'spell.component.2d.graphics.spriteSheetAppearance': {
						'assetId': spriteSheetAssetId
					},
					'spell.component.visualObject': {
						'layer': 99999999
					}
				}
			})
*/
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

			onKeyDown: function( spell, editorSystem, event ) {
				var keyCodes        = spell.inputManager.getKeyCodes(),
					selectedEntity  = editorSystem.selectedEntity,
					tilemaps        = editorSystem.tilemaps,
					tilemap         = null

				if (event.keyCode === keyCodes.SPACE && selectedEntity !== null && tilemaps[ selectedEntity ]) {

					tilemap = tilemaps[ selectedEntity ]
					this.state = STATE_SELECT_TILE

					showTilemapSelector.call( this, editorSystem.cursorWorldPosition, tilemap )

				}
			},

			onMouseDown: function( spell, editorSystem, event ) {

			},

			onMouseUp: function( spell, editorSystem, event ) {
			},

			onMouseWheel: function( spell, editorSystem, event ) {
			},

			onMouseMove: function( spell, editorSystem, event ) {
			}
		}

		return tilemapEditor

	})
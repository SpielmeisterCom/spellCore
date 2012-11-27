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

			var entityManager = this.spell.entityManager,
				tilemapSelectionEntityId = null

			tilemapSelectionEntityId = entityManager.createEntity({
				'config': {
					'spell.component.2d.transform': {
						'translation': cursorWorldPosition
					},
					'spell.component.2d.graphics.spriteSheetAppearance': {
						'assetId': tilemapAsset.asset.spriteSheet.assetId
					},
					'spell.component.visualObject': {
						'layer': 99999999
					}
				}
			})

	/*		var tilemapSelectionCursor = entityManager.createEntity({

			})
*/
		}

		var tilemapEditor = function(spell, editorSystem) {
			this.state  = STATE_INACTIVE
			this.spell  = spell
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
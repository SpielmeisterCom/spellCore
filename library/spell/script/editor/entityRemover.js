define("spell/script/editor/entityRemover",
	[
		'spell/functions'
	],
	function(
		_
		) {
		"use strict";

		var entityRemover = function(spell, editorSystem) {
		}

		entityRemover.prototype = {
			keydown: function( spell, editorSystem, event ) {
				var keyCodes        = spell.inputManager.getKeyCodes(),
					selectedEntityId  = editorSystem.selectedEntity

				if( !selectedEntityId ) {
					return
				}

				var isRemovable  = editorSystem.prototype.isRemovable.call( editorSystem, selectedEntityId )


					if( isRemovable &&
						(
							event.keyCode === keyCodes.DELETE ||
							event.keyCode === keyCodes.BACKSPACE
						)
					) {


					spell.sendMessageToEditor(
						'spelled.debug.entity.remove',
						{
							id: selectedEntityId
						}
					)

				}
			}

		}

		return entityRemover
	})
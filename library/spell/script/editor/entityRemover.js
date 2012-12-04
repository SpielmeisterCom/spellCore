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

				if( (
						event.keyCode === keyCodes.DELETE ||
						event.keyCode === keyCodes.BACKSPACE ) &&
					selectedEntityId !== null ) {


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
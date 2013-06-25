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
			keyDown: function( spell, editorSystem, event ) {
				var KEY        = spell.inputManager.KEY,
					selectedEntityId  = editorSystem.selectedEntity

				if( !selectedEntityId ) {
					return
				}

				var isRemovable  = editorSystem.prototype.isRemovable.call( editorSystem, selectedEntityId )


					if( isRemovable &&
						(
							event.keyCode === KEY.DELETE ||
							event.keyCode === KEY.BACKSPACE
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

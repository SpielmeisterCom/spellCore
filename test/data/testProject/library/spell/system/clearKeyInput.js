define(
	'spell/system/clearKeyInput',
	function() {
		'use strict'


		/**
		 * Update the actor entities action component with the player input
		 *
		 * @param spell
		 * @param timeInMs
		 * @param deltaTimeInMs
		 */
		var process = function( spell, timeInMs, deltaTimeInMs ) {
			spell.inputManager.clearInputEvents()
			spell.inputManager.clearCommands()
		}

		var ClearKeyInput = function( spell ) {}

		ClearKeyInput.prototype = {
			init : function( spell ) {},
			destroy : function( spell ) {},
			activate : function( spell ) {},
			deactivate : function( spell ) {},
			process : process
		}

		return ClearKeyInput
	}
)

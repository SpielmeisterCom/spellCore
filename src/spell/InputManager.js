/**
 * The InputManager contains functions for processing user input
 *
 * @class spell.inputManager
 * @singleton
 */
define(
	'spell/InputManager',
	[
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/input/keyCodes',
		'spell/functions'
	],
	function(
		PlatformKit,
		keyCodes,
	    _
	) {
		"use strict"

		/*
		 * public
		 */
		var inputEvents = []

		var pushIntoInputQueue = function( event ) {
			inputEvents.push( event )
		}

		var createKeyEvent = function( type, keyCode ) {
			return {
				type           : type,
				keyCode        : keyCode
			}
		}

		var InputManager = function( configurationManager, renderingContext ) {
			this.nativeInput = PlatformKit.createInput( configurationManager, renderingContext )
			this.configurationManager = configurationManager
		}

		InputManager.prototype = {
			/**
			 * Initialize the InputManager and register all input binding.
			 * This function is being called by spellCore, don't call it yourself!
			 * @private
			 */
			init : function() {
                this.nativeInput.setInputEventListener( pushIntoInputQueue )
			},

			/**
			 * Destroys the InputManager and unregister all input bindings.
			 * This function is being called by spellCore, don't call it yourself!
			 * @private
			 */
			destroy : function() {
				this.nativeInput.removeInputEventListener ( )
			},

			/**
			 * Get the InputEvents Queue
			 * @return {Array}
			 */
			getInputEvents : function() {
				return inputEvents
			},

			/**
			 * Clear the current input event queue.
			 */
			clearInputEvents : function() {
				inputEvents.length = 0

			},

			/**
			 * Returns a key value list of keyCodes
			 *
			 * The key is a human readable version of the keyCode and the value
			 * the corresponding keyCode
			 *
			 * @return {*}
			 */
			getKeyCodes: function() {
				return keyCodes
			},


			injectKeyEvent : function( type, keyCode ) {
				inputEvents.push( createKeyEvent( type, keyCode ) )
			}
		}

		return InputManager
	}
)

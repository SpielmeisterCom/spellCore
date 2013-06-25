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
		'spell/shared/util/input/keyCodes'
	],
	function(
		PlatformKit,
		keyCodes
	) {
		'use strict'


		var inputEvents = [],
			keyCodePressed = {}

		var processEvent = function( event ) {
			inputEvents.push( event )

			var type      = event.type,
				isKeyDown = type == 'keyDown'

			if( isKeyDown || type == 'keyUp' ) {
				keyCodePressed[ event.keyCode ] = isKeyDown
			}
		}

		var createKeyEvent = function( type, keyCode ) {
			return {
				type : type,
				keyCode : keyCode
			}
		}

		var InputManager = function( configurationManager, renderingContext ) {
			this.nativeInput          = PlatformKit.createInput( configurationManager, renderingContext )
			this.configurationManager = configurationManager
		}

		InputManager.prototype = {
			/**
			 * Initialize the InputManager and register all input binding.
			 * This function is being called by spellCore, don't call it yourself!
			 * @private
			 */
			init : function() {
				this.nativeInput.setInputEventListener( processEvent )
			},

			/**
			 * Destroys the InputManager and unregister all input bindings.
			 * This function is being called by spellCore, don't call it yourself!
			 * @private
			 */
			destroy : function() {
				this.nativeInput.removeInputEventListener()
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
			 * Returns true if the key with the given key code is pressed, false otherwise.
			 *
			 * @param keyCode
			 * @return {Boolean}
			 */
			isKeyPressed : function( keyCode ) {
				return !!keyCodePressed[ keyCode ]
			},

			injectKeyEvent : function( type, keyCode ) {
				inputEvents.push( createKeyEvent( type, keyCode ) )
			},

			/**
			 * Map of supported keys.
			 */
			KEY : keyCodes
		}

		return InputManager
	}
)

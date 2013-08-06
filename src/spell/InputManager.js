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
		'use strict'


		var inputEvents               = [],
			commands                  = [],
			isKeyCodePressed          = {},
			inputEventTypeToListeners = {},
			inputContexts             = {}

		var processEvent = function( event ) {
			inputEvents.push( event )

			var type      = event.type,
				isKeyDown = type === 'keyDown',
				isKeyUp   = type === 'keyUp'

			if( isKeyDown || isKeyUp ) {
				var keyCode = event.keyCode,
					repeat  = isKeyCodePressed[ keyCode ] === isKeyDown

				if( repeat ) return

				isKeyCodePressed[ keyCode ] = isKeyDown

				// create command if it is mapped by an input context
				var command = createCommand( inputContexts, keyCode, isKeyDown )

				if( command ) {
					commands.push( command )
				}
			}

			// process registered input event listeners
			var registeredListeners = inputEventTypeToListeners[ type ]

			if( registeredListeners ) {
				for( var i = 0, n = registeredListeners.length; i < n; i++ ) {
					registeredListeners[ i ].call( null, event )
				}
			}
		}

		var createCommand = function( inputContexts, keyCode, isStart ) {
			for( var id in inputContexts ) {
				var inputContext = inputContexts[ id ]

				for( var mappedKeyCode in inputContext ) {
					if( mappedKeyCode == keyCode ) {
						var command = inputContext[ mappedKeyCode ]

						// i.e. isStart = true, command = "fire" -> "startFire"
						return ( isStart ? 'start' : 'stop' ) +
							command.substr( 0, 1 ).toUpperCase() + command.substr( 1, command.length )
					}
				}
			}
		}

		var createKeyEvent = function( type, keyCode ) {
			return {
				type : type,
				keyCode : keyCode
			}
		}


		var InputManager = function( configurationManager, renderingContext ) {
			this.nativeInput = PlatformKit.createInput( configurationManager, renderingContext )
		}

		InputManager.prototype = {
			/**
			 * Initialize the InputManager and register all input binding.
			 * This function is being called by spellCore, don't call it yourself!
			 *
			 * @private
			 */
			init : function() {
				this.nativeInput.setInputEventListener( processEvent )
			},

			/**
			 * Destroys the InputManager and unregister all input bindings.
			 * This function is being called by spellCore, don't call it yourself!
			 *
			 * @private
			 */
			destroy : function() {
				this.nativeInput.removeInputEventListener()
			},

			/**
			 * Get the InputEvents queue
			 *
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
			 * Returns true if the key with the given key code is currently pressed, false otherwise.
			 *
			 * @param {String} keyCode
			 * @return {Boolean}
			 */
			isKeyPressed : function( keyCode ) {
				return isKeyCodePressed[ keyCode ]
			},

			/**
			 * Injects a key event into the input manager processing pipeline.
			 *
			 * @param {String} type the key event type (keyDown, keyUp)
			 * @param {String} keyCode the key code
			 */
			injectKeyEvent : function( type, keyCode ) {
				processEvent( createKeyEvent( type, keyCode ) )
			},

			/**
			 * Adds an input event listener.
			 *
			 * @param {String} eventType the event type (keyDown, keyUp, pointerDown, pointerMove, pointerUp, pointerCancel)
			 * @param {Function} listener the listener function
			 */
			addListener : function( eventType, listener ) {
				var registeredListeners = inputEventTypeToListeners[ eventType ] || ( inputEventTypeToListeners[ eventType ] = [] )

				registeredListeners.push( listener )
			},

			/**
			 * Removes an input event listener.
			 *
			 * @param {String} eventType the event type (keyDown, keyUp, pointerDown, pointerMove, pointerUp, pointerCancel)
			 * @param {Function} listener the listener function
			 */
			removeListener : function( eventType, listener ) {
				var registeredListeners = inputEventTypeToListeners[ eventType ]

				if( !registeredListeners ) return

				inputEventTypeToListeners[ eventType ] = _.filter(
					registeredListeners,
					function( registeredListener ) {
						return registeredListener === listener
					}
				)
			},

			/**
			 * Adds an input context.
			 *
			 * @param {String} id the id of the input context
			 * @param {Object} config the configuration object
			 */
			addInputContext : function( id, config ) {
				inputContexts[ id ] = config
			},

			/**
			 * Removes an input context.
			 *
			 * @param {String} id the id of the input context
			 */
			removeInputContext : function( id ) {
				delete inputContexts[ id ]
			},

			/**
			 * Returns the list of queued commands.
			 *
			 * @return {Array}
			 */
			getCommands : function() {
				return commands
			},

			/**
			 * Clears the list of queued commands.
			 */
			clearCommands : function() {
				commands.length = 0
			},

			/**
			 * Map of supported keys.
			 */
			KEY : keyCodes
		}

		return InputManager
	}
)

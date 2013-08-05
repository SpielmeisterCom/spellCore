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
		'spell/shared/util/xor',

		'spell/functions'
	],
	function(
		PlatformKit,
		keyCodes,
		xor,

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
				return isKeyCodePressed[ keyCode ]
			},

			injectKeyEvent : function( type, keyCode ) {
				processEvent( createKeyEvent( type, keyCode ) )
			},

			addListener : function( eventType, listener ) {
				var registeredListeners = inputEventTypeToListeners[ eventType ] || ( inputEventTypeToListeners[ eventType ] = [] )

				registeredListeners.push( listener )
			},

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

			addInputContext : function( id, config ) {
				inputContexts[ id ] = config
			},

			removeInputContext : function( id ) {
				delete inputContexts[ id ]
			},

			getCommands : function() {
				return commands
			},

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

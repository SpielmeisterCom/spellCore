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


		var inputEvents       = [],
			commands          = [],
			keyCodeToKeyState = {},
			inputContexts     = {}

		var processEvent = function( event ) {
			inputEvents.push( event )

			var type      = event.type,
				keyCode   = event.keyCode,
				isKeyDown = type == 'keyDown',
				isKeyUp   = type == 'keyUp'

			if( xor( isKeyDown, isKeyUp ) ) {
				var keyState = getKeyState( keyCode )

				if( keyState.isPressed == isKeyDown ) {
					return
				}

				keyState.isPressed = isKeyDown

				processOnKey( isKeyDown ? keyState.onKeyDown : keyState.onKeyUp )

				// create command if it is mapped by an input context
				var command = createCommand( inputContexts, keyCode, isKeyDown )

				if( command ) {
					commands.push( command )
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

		var createKeyState = function() {
			return {
				isPressed : false,
				onKeyDown : [],
				onKeyUp : []
			}
		}

		var getKeyState = function( keyCode ) {
			return keyCodeToKeyState[ keyCode ] || ( keyCodeToKeyState[ keyCode ] = createKeyState() )
		}

		var createKeyEvent = function( type, keyCode ) {
			return {
				type : type,
				keyCode : keyCode
			}
		}

		var addOnKey = function( keyCodeHandlers, handler ) {
			return ( keyCodeHandlers ? keyCodeHandlers : [] ).concat( handler )
		}

		var removeOnKey = function( keyCodeHandlers, handler ) {
			return keyCodeHandlers ?
				_.reject(
					keyCodeHandlers,
					function( x ) {
						return x == handler
					}
				) :
				[]
		}

		var processOnKey = function( keyCodeHandlers ) {
			if( !keyCodeHandlers ) return

			for( var i = 0, n = keyCodeHandlers.length; i < n; i++ ) {
				keyCodeHandlers[ i ].call()
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
				return getKeyState( keyCode ).isPressed
			},

			injectKeyEvent : function( type, keyCode ) {
				processEvent( createKeyEvent( type, keyCode ) )
			},

			/**
			 * Adds a key down handler.
			 *
			 * @param keyCode
			 * @param handler
			 */
			addOnKeyDown : function( keyCode, handler ) {
				var keyState = getKeyState( keyCode )

				keyState.onKeyDown = addOnKey( keyState.onKeyDown, handler )
			},

			/**
			 * Removes a key down handler
			 *
			 * @param keyCode
			 * @param handler
			 */
			removeOnKeyDown : function( keyCode, handler ) {
				var keyState = getKeyState( keyCode )

				keyState.onKeyDown = removeOnKey( keyState.onKeyDown, handler )
			},

			/**
			 * Adds a key up handler.
			 *
			 * @param keyCode
			 * @param handler
			 */
			addOnKeyUp : function( keyCode, handler ) {
				var keyState = getKeyState( keyCode )

				keyState.onKeyUp = addOnKey( keyState.onKeyUp, handler )
			},

			/**
			 * Removes a key up handler.
			 *
			 * @param keyCode
			 * @param handler
			 */
			removeOnKeyUp : function( keyCode, handler ) {
				var keyState = getKeyState( keyCode )

				keyState.onKeyUp = removeOnKey( keyState.onKeyUp, handler )
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

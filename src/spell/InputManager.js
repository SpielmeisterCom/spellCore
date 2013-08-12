/**
 * The InputManager provides handling of user input.
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
			 * Example:
			 *
			 *     var inputManager = spell.inputManager
			 *
			 *     if( inputManager.isKeyPressed( inputManager.KEY.SPACE ) ) {
			 *         // do stuff
			 *     }
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
			 * Adds a listener for events of the type specified by eventType.
			 *
			 * Example:
			 *
			 *     var processSpaceDown = function( event ) {
			 *         if( event.keyCode === spell.inputManager.KEY.SPACE ) {
			 *             // do something clever
			 *         }
			 *     }
			 *
			 *     spell.inputManager.addListener( 'keyDown', processSpaceDown )
			 *
			 * @param {String} eventType can be any of the following values: keyDown, keyUp, pointerDown, pointerMove, pointerUp, pointerCancel
			 * @param {Function} listener
			 */
			addListener : function( eventType, listener ) {
				var registeredListeners = inputEventTypeToListeners[ eventType ] || ( inputEventTypeToListeners[ eventType ] = [] )

				registeredListeners.push( listener )
			},

			/**
			 * Removes a listener for events of the type specified by eventType
			 *
			 * Example:
			 *
			 *     var processSpaceDown = function( event ) {
			 *         if( event.keyCode === spell.inputManager.KEY.SPACE ) {
			 *             // do something clever
			 *         }
			 *     }
			 *
			 *     spell.inputManager.removeListener( 'keyDown', processSpaceDown )
			 *
			 * @param {String} eventType can be any of the following values: keyDown, keyUp, pointerDown, pointerMove, pointerUp, pointerCancel
			 * @param {Function} listener
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
			 * Example:
			 *
			 *     spell.inputManager.addInputContext(
			 *         'myInputContext',
			 *         spell.assetManager.get( 'myGame.myInputMapAsset' )
			 *     )
			 *
			 * @param {String} id a unique string that identifies the input context
			 * @param {Object} inputMap the inputMap asset maps input to commands
			 */
			addInputContext : function( id, inputMap ) {
				inputContexts[ id ] = inputMap
			},

			/**
			 * Removes an input context.
			 *
			 * Example:
			 *
			 *     spell.inputManager.removeInputContext( 'myInputContext' )
			 *
			 * @param {String} id a unique string that identifies the input context
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

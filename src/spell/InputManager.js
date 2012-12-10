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
		 * private
		 */
		var nextSequenceNumber = 0

		/*
		 * public
		 */
		var inputEvents = []

		var mouseClickHandler = function( event ) {
			// scale screen space position to "world" position
			event.position[ 0 ] *= this.configurationManager.currentScreenSize[ 0 ]
			event.position[ 1 ] *= this.configurationManager.currentScreenSize[ 1 ]

			var internalEvent = {
				type           : event.type, //mousedown, mouseup
				sequenceNumber : nextSequenceNumber++,
                position       : event.position,
				button         : event.button
			}

			inputEvents.push( internalEvent )
		}

		var mouseMoveHandler = function( event ) {
			// scale screen space position to "world" position
			event.position[ 0 ] *= this.configurationManager.currentScreenSize[ 0 ]
			event.position[ 1 ] *= this.configurationManager.currentScreenSize[ 1 ]

			var internalEvent = {
				type           : event.type, //mousemove
				sequenceNumber : nextSequenceNumber++,
				position       : event.position
			}

			inputEvents.push( internalEvent )
		}

		var mouseWheelHandler = function( event ) {

			var internalEvent = {
				type           : event.type, // mousewheel
				sequenceNumber : nextSequenceNumber++,
				direction      : event.direction
			}

			inputEvents.push( internalEvent )
		}

        var touchHandler = function( event ) {
	        // scale screen space position to "world" position
	        event.position[ 0 ] *= this.configurationManager.currentScreenSize[ 0 ]
	        event.position[ 1 ] *= this.configurationManager.currentScreenSize[ 1 ]

            var internalEvent = {
                type           : ( event.type === 'touchstart' ? 'mousedown' : 'mouseup' ),
                sequenceNumber : nextSequenceNumber++,
                position       : event.position
            }

            inputEvents.push( internalEvent )
        }

		var keyHandler = function( event ) {
			inputEvents.push( createKeyEvent( event.type, event.keyCode ) )
		}

		var createKeyEvent = function( type, keyCode ) {
			return {
				type           : type,
				keyCode        : keyCode,
				sequenceNumber : nextSequenceNumber++
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
				if( PlatformKit.features.touch ) {
					this.nativeInput.setInputEventListener( 'touchstart', _.bind( touchHandler, this ) )
					this.nativeInput.setInputEventListener( 'touchend',  _.bind( touchHandler, this ) )
				}

                this.nativeInput.setInputEventListener( 'mousedown',  _.bind( mouseClickHandler, this ) )
                this.nativeInput.setInputEventListener( 'mouseup',  _.bind( mouseClickHandler, this ) )
				this.nativeInput.setInputEventListener( 'mousemove',  _.bind( mouseMoveHandler, this ) )
				this.nativeInput.setInputEventListener( 'mousewheel',  _.bind( mouseWheelHandler, this ) )

				this.nativeInput.setInputEventListener( 'keydown',  _.bind( keyHandler, this ) )
				this.nativeInput.setInputEventListener( 'keyup',  _.bind( keyHandler, this ) )
			},

			/**
			 * Destroys the InputManager and unregister all input bindings.
			 * This function is being called by spellCore, don't call it yourself!
			 * @private
			 */
			destroy : function() {
				if( PlatformKit.features.touch ) {
					this.nativeInput.removeInputEventListener( 'touchstart' )
					this.nativeInput.removeInputEventListener( 'touchend' )
				}

                this.nativeInput.removeInputEventListener( 'mousedown' )
                this.nativeInput.removeInputEventListener( 'mouseup' )
				this.nativeInput.removeInputEventListener( 'mousemove' )
				this.nativeInput.removeInputEventListener( 'mousewheel' )

				this.nativeInput.removeInputEventListener( 'keydown' )
				this.nativeInput.removeInputEventListener( 'keyup' )
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

define(
	'spell/shared/util/createDebugMessageHandler',
	function() {
		'use strict'


		/*
		 * Creates an object with the properties defined by the array "keys". Each property has a unique Number.
		 */
		return function( inputManager ) {
			return function( message ) {
				if( message.type === 'keyEvent' ) {
					var payload = message.payload,
						type = payload.type

					if( type === 'keydown' ||
						type === 'keyup' ) {

						inputManager.injectKeyEvent( type, payload.keyCode )
					}
				}
			}
		}
	}
)

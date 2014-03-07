define(
	'spell/shared/util/platform/private/ouya',
	[
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',
		'spell/shared/util/platform/private/environment/isHtml5TeaLeaf'
	],
	function(
		isHtml5Ejecta,
		isHtml5TeaLeaf
		) {
		'use strict'

		var last
		var ACTION = {
			DOWN: 1,
			UP: 2
		}

		var BUTTON  = {
			O: 96,
			U: 99,
			Y: 100,
			A: 97,
			MENU: 82,
			DPAD: {
				UP: 19,
				DOWN: 20,
				RIGHT: 22,
				LEFT: 21
			},
			L: [
				0,
				104,
				102,
				106
			],
			R: [
				0,
				105,
				103,
				107
			]
		}

		var analogToDigital = function( inputManager, x, y ) {

			if ( x < -0.15 ) {
				if( inputManager.isKeyPressed( inputManager.KEY.RIGHT_ARROW )) {
					inputManager.injectKeyEvent( 'keyUp', inputManager.KEY.RIGHT_ARROW )
				}

				if( !inputManager.isKeyPressed( inputManager.KEY.LEFT_ARROW ) ) {
					inputManager.injectKeyEvent( 'keyDown', inputManager.KEY.LEFT_ARROW )
				}

			} else if ( x > 0.15 ) {
				if( inputManager.isKeyPressed( inputManager.KEY.LEFT_ARROW )) {
					inputManager.injectKeyEvent( 'keyUp', inputManager.KEY.LEFT_ARROW )
				}

				if( !inputManager.isKeyPressed( inputManager.KEY.RIGHT_ARROW ) ) {
					inputManager.injectKeyEvent( 'keyDown', inputManager.KEY.RIGHT_ARROW )
				}
			} else {

				if( inputManager.isKeyPressed( inputManager.KEY.LEFT_ARROW )) {
					inputManager.injectKeyEvent( 'keyUp', inputManager.KEY.LEFT_ARROW )
				}

				if( inputManager.isKeyPressed( inputManager.KEY.RIGHT_ARROW )) {
					inputManager.injectKeyEvent( 'keyUp', inputManager.KEY.RIGHT_ARROW )
				}
			}

			if ( y < -0.15 ) {
				if( inputManager.isKeyPressed( inputManager.KEY.DOWN_ARROW )) {
					inputManager.injectKeyEvent( 'keyUp', inputManager.KEY.DOWN_ARROW )
				}

				if( !inputManager.isKeyPressed( inputManager.KEY.UP_ARROW ) ) {
					inputManager.injectKeyEvent( 'keyDown', inputManager.KEY.UP_ARROW )
				}

			} else if ( y > 0.15 ) {
				if( inputManager.isKeyPressed( inputManager.KEY.UP_ARROW )) {
					inputManager.injectKeyEvent( 'keyUp', inputManager.KEY.UP_ARROW )
				}

				if( !inputManager.isKeyPressed( inputManager.KEY.DOWN_ARROW ) ) {
					inputManager.injectKeyEvent( 'keyDown', inputManager.KEY.DOWN_ARROW )
				}
			} else {

				if( inputManager.isKeyPressed( inputManager.KEY.UP_ARROW )) {
					inputManager.injectKeyEvent( 'keyUp', inputManager.KEY.UP_ARROW )
				}

				if( inputManager.isKeyPressed( inputManager.KEY.DOWN_ARROW )) {
					inputManager.injectKeyEvent( 'keyUp', inputManager.KEY.DOWN_ARROW )
				}
			}
		}

		return {


			init: 	function( inputManager ) {
				NATIVE.events.registerHandler( 'ouyakey', function( evt ) {
					// TODO: respect evt.player

					var keyCode,
						action

					if( evt.action == ACTION.DOWN ) {
						action = 'keyDown'
					} else if ( evt.action == ACTION.UP ) {
						action = 'keyUp'
					}

					if( evt.code == BUTTON.O ) {
						keyCode = inputManager.KEY.O

					} else if ( evt.code == BUTTON.U ) {
						keyCode = inputManager.KEY.U

					} else if ( evt.code == BUTTON.Y ) {
						keyCode = inputManager.KEY.Y

					} else if ( evt.code == BUTTON.A ) {
						keyCode = inputManager.KEY.A

					} else if ( evt.code == BUTTON.DPAD.UP ) {
						keyCode = inputManager.KEY.UP_ARROW

					} else if ( evt.code == BUTTON.DPAD.DOWN ) {
						keyCode = inputManager.KEY.DOWN_ARROW

					} else if ( evt.code == BUTTON.DPAD.LEFT ) {
						keyCode = inputManager.KEY.LEFT_ARROW

					} else if ( evt.code == BUTTON.DPAD.RIGHT ) {
						keyCode = inputManager.KEY.RIGHT_ARROW

					} else if ( evt.code == BUTTON.MENU ) {
						keyCode = inputManager.KEY.MENU
					}

					inputManager.injectKeyEvent(
						action,
						keyCode
					)
				})

				NATIVE.events.registerHandler( 'ouyamotion', function( evt ) {
					//TODO: this must be exchanged with a 2 axis controller input manager
					// TODO: respect evt.player, evt.l2, evt.r2, evt.rsx, evt.rsy

					//process right stick if left stick is unused
					analogToDigital( inputManager, evt.lsx, evt.lsy )
				})
			}
		}
	}
)

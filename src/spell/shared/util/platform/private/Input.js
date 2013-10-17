define(
	'spell/shared/util/platform/private/Input',
	[
		'spell/shared/util/platform/private/input/deviceOrientationHandler',
		'spell/shared/util/platform/private/input/keyHandler',
		'spell/shared/util/platform/private/input/pointerHandler',
		'spell/shared/util/platform/private/input/mousewheelHandler'
	],
	function(
		deviceOrientationHandler,
		keyHandler,
		pointerHandler,
		mousewheelHandler
	) {
		'use strict'


		var preventDefaultHandler = function( event ) {
			event.preventDefault()
		}

		var setListener = function( callback ) {
			// disable context menu on right click
			document.addEventListener( 'contextmenu', preventDefaultHandler, true )

			deviceOrientationHandler.registerListener( window, callback )
			keyHandler.registerListener( document, callback )
			mousewheelHandler.registerListener( document, callback )
			pointerHandler.registerListener( document, this.container, this.configurationManager, callback )
		}

		var removeListener = function() {
			deviceOrientationHandler.removeListener( window )
			keyHandler.removeListener( document )
			mousewheelHandler.removeListener( document )
			pointerHandler.removeListener( document )
		}

		var Input = function( configurationManager, renderingContext ) {
			this.configurationManager = configurationManager
			this.container            = renderingContext.getCanvasElement()
		}

		Input.prototype = {
			setInputEventListener : setListener,
			removeInputEventListener : removeListener
		}

		return Input
	}
)

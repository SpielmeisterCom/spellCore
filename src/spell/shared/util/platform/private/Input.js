define(
	'spell/shared/util/platform/private/Input',
	[
		'spell/shared/util/platform/private/system/features',

		'spell/shared/util/platform/private/input/keyHandler',
		'spell/shared/util/platform/private/input/pointerHandler',
		'spell/shared/util/platform/private/input/mousewheelHandler',

		'spell/functions'
	],
	function(
		features,

		keyHandler,
		pointerHandler,
		mousewheelHandler,

		_
	) {
		'use strict'

		var preventDefaultHandler = function( event ) {
			event.preventDefault()
		}

		var setListener = function( callback ) {
			//disable context menu on right click
			document.addEventListener( 'contextmenu', preventDefaultHandler, true )

			keyHandler.registerListener( document, callback )
			mousewheelHandler.registerListener( document, callback )
			pointerHandler.registerListener( this.container, callback )
		}

		var removeListener = function( ) {
			keyHandler.removeListener( document )
			mousewheelHandler.removeListener( document )
			pointerHandler.removeListener( document )
		}


		var Input = function( configurationManager, renderingContext ) {
			this.configurationManager = configurationManager
			this.container = renderingContext.getCanvasElement()
		}

		Input.prototype = {
			setInputEventListener : setListener,
			removeInputEventListener : removeListener
		}

		return Input
	}
)

/**
 * WheelEvents
 *
 * interface WheelEvent : MouseEvent {
 *      // DeltaModeCode
 *      const unsigned long              DOM_DELTA_PIXEL = 0x00;
 *      const unsigned long              DOM_DELTA_LINE  = 0x01;
 *      const unsigned long              DOM_DELTA_PAGE  = 0x02;
 *
 *      readonly attribute double         deltaX;
 *      readonly attribute double         deltaY;
 *      readonly attribute double         deltaZ;
 *      readonly attribute unsigned long deltaMode;
 *  };
 */
define(
	'spell/shared/util/platform/private/input/mousewheelHandler',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var nativeHandler

		var nativeHandlerImpl = function( callback, event ) {
			event.preventDefault()

			var delta     = event.wheelDelta ? event.wheelDelta : event.detail * -1,
				direction = delta > 0 ? 1 : -1

			callback( {
				type : 'mouseWheel',
				direction : direction
			} )
		}

		var registerListener = function( el, callback ) {
			nativeHandler = _.bind( nativeHandlerImpl, this, callback )

			el.addEventListener( 'mousewheel', nativeHandler, true )
			el.addEventListener( 'DOMMouseScroll', nativeHandler, true )
		}

		var removeListener = function( el ) {
			if( nativeHandler ) {
				el.removeEventLister( 'mousewheel', nativeHandler )
				el.removeEventLister( 'DOMMouseScroll', nativeHandler )

				nativeHandler = undefined
			}
		}

		return {
			registerListener : registerListener,
			removeListener : removeListener
		}
	}
)

/**
 * This function handles DOM Level 3 mouse events and pointer events
 * see http://www.w3.org/TR/DOM-Level-3-Events/
 * http://www.w3.org/Submission/pointer-events/#list-of-pointer-events
 *
 * Touch Events:
 * http://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html#//apple_ref/doc/uid/TP40009358
 * https://dvcs.w3.org/hg/webevents/raw-file/tip/touchevents.html
 *
 *
 * interface Event {
 *      const unsigned short              NONE            = 0;
 *      const unsigned short              CAPTURING_PHASE = 1;
 *      const unsigned short              AT_TARGET       = 2;
 *      const unsigned short              BUBBLING_PHASE  = 3;
 *
 *      readonly attribute DOMString      type;
 *      readonly attribute EventTarget?   target;
 *      readonly attribute EventTarget?   currentTarget;
 *      readonly attribute unsigned short eventPhase;
 *      readonly attribute boolean        bubbles;
 *      readonly attribute boolean        cancelable;
 *      readonly attribute DOMTimeStamp   timeStamp;
 *      void                              stopPropagation();
 *      void                              preventDefault();
 *      void                              initEvent(DOMString eventTypeArg, boolean canBubbleArg, boolean cancelableArg);
 *
 *      void                              stopImmediatePropagation();
 *      readonly attribute boolean        defaultPrevented;
 *      readonly attribute boolean        isTrusted;
 * };
 *
 * interface UIEvent : Event {
 *      readonly attribute views::AbstractView  view;
 *      readonly attribute long             detail;
 * };
 *
 * interface MouseEvent : UIEvent {
 *      readonly attribute long           screenX;
 *      readonly attribute long           screenY;
 *      readonly attribute long           clientX;
 *      readonly attribute long           clientY;
 *      readonly attribute boolean        ctrlKey;
 *      readonly attribute boolean        shiftKey;
 *      readonly attribute boolean        altKey;
 *      readonly attribute boolean        metaKey;
 *      readonly attribute unsigned short button;
 *      readonly attribute unsigned short buttons;
 *      readonly attribute EventTarget?   relatedTarget;
 *      boolean                           getModifierState(DOMString keyArg);
 * };
 *
 * interface TouchEvent : UIEvent {
 *      readonly attribute TouchList   touches;
 *      readonly attribute TouchList   targetTouches;
 *      readonly attribute TouchList   changedTouches;
 *      readonly attribute boolean     altKey;
 *      readonly attribute boolean     metaKey;
 *      readonly attribute boolean     ctrlKey;
 *      readonly attribute boolean     shiftKey;
 *      readonly attribute EventTarget relatedTarget
 * };
 *
 * interface PointerEvent : MouseEvent {
 *      const unsigned short POINTER_TYPE_UNAVAILABLE = 0x00000001;
 *      const unsigned short POINTER_TYPE_TOUCH = 0x00000002;
 *      const unsigned short POINTER_TYPE_PEN = 0x00000003;
 *      const unsigned short POINTER_TYPE_MOUSE = 0x00000004;
 *      readonly attribute long               pointerId;
 *      readonly attribute long               width;
 *      readonly attribute long               height;
 *      readonly attribute float              pressure;
 *      readonly attribute long               tiltX;
 *      readonly attribute long               tiltY;
 *      readonly attribute long               pointerType;
 *      readonly attribute unsigned long long hwTimestamp;
 *      readonly attribute boolean            isPrimary;
 * };
 */
define(
	'spell/shared/util/platform/private/input/pointerHandler',
	[
		'spell/shared/util/platform/private/input/support',
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',

		'spell/functions'
	],
	function(
		supportedInputApi,
		isHtml5Ejecta,
		_
	) {
		'use strict'

		var IS_MOBILE_SAFARI = false,
			IS_MOBILE_CHROME = false

		if( navigator && navigator.platform && navigator.userAgent ) {
			IS_MOBILE_SAFARI = !!navigator.platform.match( /^(iPad|iPod|iPhone)$/ )
			IS_MOBILE_CHROME = !!navigator.userAgent.match( /Chrome\/[.0-9]* Mobile/ )
		}

		var nativeHandler = null
		var nativeClickHandler = null

		var registeredEvents = [ ]
		var eventMappings = {
			pointermove     : 'pointerMove',
			pointerup       : 'pointerUp',
			pointerdown     : 'pointerDown',
			pointercancel   : 'pointerCancel',

			MSPointerMove   : 'pointerMove',
			MSPointerUp     : 'pointerUp',
			MSPointerDown   : 'pointerDown',
			MSPointerCancel : 'pointerCancel',

			touchstart      : 'pointerDown',
			touchmove       : 'pointerMove',
			touchend        : 'pointerUp',
			touchcancel     : 'pointerCancel',

			mousemove       : 'pointerMove',
			mousedown       : 'pointerDown',
			mouseup         : 'pointerUp'
		}

		var emitSpellPointerEvent = function( callback, eventType, pointerId, button, positionX, positionY ) {
			callback( {
				type      : eventType,
				pointerId : pointerId,
				button    : button, // 0=left button, 1=middle button if present, 2=right button
				position  : [ positionX, positionY ] // position of the pointer in screen coordinates (origin top left!)
			} )

			if( !supportedInputApi.hasNativeClickEvent() &&
				eventType === 'pointerDown' ) {

				callback( {
					type      : 'click',
					pointerId : 0,
					button    : 0, // 0=left button, 1=middle button if present, 2=right button
					position  : [ positionX, positionY ] // position of the pointer in screen coordinates (origin top left!)
				} )
			}
		}

		function getOffset( element ) {
			if( isHtml5Ejecta || !element.getBoundingClientRect ) {
				return [ 0, 0 ]
			}

			var box = element.getBoundingClientRect()

			var body    = document.body
			var docElem = document.documentElement

			var scrollTop  = window.pageYOffset || docElem.scrollTop || body.scrollTop
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

			var clientTop  = docElem.clientTop || body.clientTop || 0
			var clientLeft = docElem.clientLeft || body.clientLeft || 0

			var top  = box.top + scrollTop - clientTop
			var left = box.left + scrollLeft - clientLeft

			return [ Math.round( left ), Math.round( top ) ]
		}

		var nativeTouchHandlerImpl = function( callback, eventMappings, container, configurationManager, event ) {
			var eventType  = event.type,
				button     = 0,
				screenSize = configurationManager.getValue( 'currentScreenSize' ),
				offset     = getOffset( container )

			// only preventDefault on touchmove, otherwise no click event is triggered in mobile Safari
			if( eventType == 'touchmove' ) {
				event.preventDefault()
			}

			if( !IS_MOBILE_SAFARI && !IS_MOBILE_CHROME && eventType == 'touchstart' ) {
				//don't preventDefault on touchstart on iOS, because otherwise no click event is triggered
				event.preventDefault()
			}

			if( eventMappings[ eventType ] ) {
				eventType = eventMappings[ eventType ]
			}

			for( var i = 0, length = event.changedTouches.length; i < length; i++ ) {
				var touch     = event.changedTouches[ i ],
					pointerId = touch.identifier,
					positionX = touch.pageX - offset[ 0 ],
					positionY = touch.pageY - offset[ 1 ]

				// if the event missed the display it gets ignored
				if( positionX < 0 || positionX > screenSize[ 0 ] ||
					positionY < 0 || positionY > screenSize [ 1 ] ) {

					continue
				}

				emitSpellPointerEvent( callback, eventType, pointerId, button, positionX, positionY )
			}
		}

		var nativePointerHandlerImpl = function( callback, eventMappings, container, configurationManager, event ) {
			var eventType  = event.type,
				button     = event.button,
				pointerId  = typeof event.pointerId != "undefined" ? event.pointerId :  1,
				screenSize = configurationManager.getValue( 'currentScreenSize' ),
				offset     = getOffset( container ),
				positionX  = event.pageX - offset[ 0 ],
				positionY  = event.pageY - offset[ 1 ]

			// if the event missed the display it gets ignored
			if( positionX < 0 || positionX > screenSize[ 0 ] ||
				positionY < 0 || positionY > screenSize [ 1 ] ) {

				return
			}

			if( button > 0 ) {
				// only prevent default for non left click buttons
				event.preventDefault()
			}

			if( eventMappings[ eventType ] ) {
				eventType = eventMappings[ eventType ]
			}


			emitSpellPointerEvent( callback, eventType, pointerId, button, positionX, positionY )
		}

		var nativeClickHandlerImpl = function( callback, eventMappings, container, configurationManager, event ) {
			var eventType  = event.type,
				screenSize = configurationManager.getValue( 'currentScreenSize' ),
				offset     = getOffset( container ),
				positionX  = event.pageX - offset[ 0 ],
				positionY  = event.pageY - offset[ 1 ]

			// if the event missed the display it gets ignored
			if( positionX < 0 || positionX > screenSize[ 0 ] ||
				positionY < 0 || positionY > screenSize [ 1 ] ) {

				return false
			}

			emitSpellPointerEvent( callback, eventType, 0, 0, positionX, positionY )
		}

		var registerListener = function( el, container, configurationManager, callback ) {
			if( supportedInputApi.hasPointerApi() ) {
				nativeHandler = _.bind( nativePointerHandlerImpl, this, callback, eventMappings, container, configurationManager )
				registeredEvents = [
					'pointermove', 'pointerup', 'pointerdown', 'pointercancel'
				]

			} else if( supportedInputApi.hasMicrosoftPointerApi() ) {
				nativeHandler = _.bind( nativePointerHandlerImpl, this, callback, eventMappings, container, configurationManager )
				registeredEvents = [
					'MSPointerMove', 'MSPointerUp', 'MSPointerDown', 'MSPointerCancel'
				]

			} else if( supportedInputApi.hasWebkitTouchApi() ) {
				nativeHandler = _.bind( nativeTouchHandlerImpl, this, callback, eventMappings, container, configurationManager )
				registeredEvents = [
					'touchstart', 'touchmove', 'touchend', 'touchcancel'
				]

			} else {
				// use generic mouse events as input source
				nativeHandler = _.bind( nativePointerHandlerImpl, this, callback, eventMappings, container, configurationManager )
				registeredEvents = [
					'mousemove', 'mousedown', 'mouseup'
				]
			}

			for( var i in registeredEvents ) {
				el.addEventListener( registeredEvents[ i ], nativeHandler, true )
			}

			nativeClickHandler = _.bind( nativeClickHandlerImpl, this, callback, eventMappings, container, configurationManager )
			el.addEventListener( 'click', nativeClickHandler, true )
		}

		var removeListener = function( el ) {
			if( nativeHandler !== null ) {
				for( var i in registeredEvents ) {
					el.removeEventListener( registeredEvents[ i ], nativeHandler )
				}
				registeredEvents.length = 0
				nativeHandler = null
			}

			el.removeEventListener( 'click', nativeClickHandler )
			nativeClickHandler = null
		}

		return {
			registerListener : registerListener,
			removeListener : removeListener
		}
	}
)

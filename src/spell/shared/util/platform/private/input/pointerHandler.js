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
		'spell/functions'
	],
	function( _ ) {
		"use strict";

		var nativeHandler = null
		var registeredEvents = [ ]
		var eventMappings = {
			'pointermove'       : 'pointerMove',
			'pointerup'         : 'pointerUp',
			'pointerdown'       : 'pointerDown',
			'pointercancel'     : 'pointerCancel',

			'MSPointerMove'     : 'pointerMove',
			'MSPointerUp'       : 'pointerUp',
			'MSPointerDown'     : 'pointerDown',
			'MSPointerCancel'   : 'pointerCancel',

			'touchstart'        : 'pointerDown',
			'touchmove'         : 'pointerMove',
			'touchend'          : 'pointerUp',
			'touchcancel'       : 'pointerCancel',

			'mousemove'         : 'pointerMove',
			'mousedown'         : 'pointerDown',
			'mouseup'           : 'pointerUp'
		}

		var hasTouchSupport = function() {
			return ( 'ontouchstart' in window ) || ( window.DocumentTouch && document instanceof DocumentTouch )
		}

		var emitSpellPointerEvent = function( callback, eventType, pointerId, button, positionX, positionY ) {
			callback({
				type :      eventType,
				pointerId : pointerId,
				button :    button, // 0=left button, 1=middle button if present, 2=right button
				position :  [ positionX, positionY ] //position of the pointer in screen coordinates (origin top left!)
			})
		}

		var nativeTouchHandlerImpl = function( callback, eventMappings, event ) {
			var eventType   = event.type,
				button      = 0

			event.preventDefault()

			if( eventMappings[ eventType ] ) {
				eventType = eventMappings[ eventType ]
			}

			for( var i = 0, length = event.changedTouches.length; i < length; i++ ) {
				var touch       = event.changedTouches[ i ],
					pointerId   = touch.identifier,
					positionX   = touch.clientX,
					positionY   = touch.clientY

				emitSpellPointerEvent( callback, eventType, pointerId, button, positionX, positionY )
			}
		}

		var nativePointerHandlerImpl = function( callback, eventMappings, event ) {
			var eventType   = event.type,
				button      = event.button,
				pointerId   = event.pointerId !== undefined ? event.pointerId :  1,
				positionX   = event.clientX,
				positionY   = event.clientY

			event.preventDefault()

			if( eventMappings[ eventType ] ) {
				eventType = eventMappings[ eventType ]
			}

			emitSpellPointerEvent( callback, eventType, pointerId, button, positionX, positionY )
		}

		var registerListener = function( el, callback ) {
			if ( window.navigator.pointerEnabled ) {
				nativeHandler = _.bind( nativePointerHandlerImpl, this, callback, eventMappings )
				registeredEvents = [
					'pointermove', 'pointerup', 'pointerdown', 'pointercancel'
				]

			} else if ( window.navigator.msPointerEnabled ) {
				nativeHandler = _.bind( nativePointerHandlerImpl, this, callback, eventMappings )
				registeredEvents = [
					'MSPointerMove', 'MSPointerUp', 'MSPointerDown', 'MSPointerCancel'
				]

			} else if ( hasTouchSupport() ) {
				nativeHandler = _.bind( nativeTouchHandlerImpl, this, callback, eventMappings )
				registeredEvents = [
					'touchstart', 'touchmove', 'touchend', 'touchcancel'
				]

			} else {
				nativeHandler = _.bind( nativePointerHandlerImpl, this, callback, eventMappings )
				registeredEvents = [
					'mousemove', 'mousedown', 'mouseup'
				]
			}

			for ( var i in registeredEvents ) {
				var eventName = registeredEvents[ i ]
				el.addEventListener( eventName, nativeHandler, true )
			}

		}

		var removeListener = function( el ) {
			if( nativeHandler !== null ) {

				for ( var i in registeredEvents ) {
					var eventName = registeredEvents[ i ]
					el.removeEventListener( eventName, nativeHandler )
				}
				registeredEvents.length = 0
				nativeHandler = null
			}
		}

		return {
			registerListener: registerListener,
			removeListener: removeListener
		}
	}
)
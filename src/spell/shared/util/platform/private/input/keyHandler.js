/**
 * http://www.w3.org/TR/DOM-Level-3-Events/#key-algorithm
 * http://www.w3.org/TR/DOM-Level-3-Events/#keys-keyvalues
 * http://www.w3.org/TR/DOM-Level-3-Events/#key-values
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
 * interface KeyboardEvent : UIEvent {
 *      // KeyLocationCode
 *      const unsigned long       DOM_KEY_LOCATION_STANDARD      = 0x00;
 *      const unsigned long       DOM_KEY_LOCATION_LEFT          = 0x01;
 *      const unsigned long       DOM_KEY_LOCATION_RIGHT         = 0x02;
 *      const unsigned long       DOM_KEY_LOCATION_NUMPAD        = 0x03;
 *
 *      readonly attribute DOMString       keyIdentifier;
 *      readonly attribute unsigned long   keyLocation;
 *      readonly attribute boolean         ctrlKey;
 *      readonly attribute boolean         shiftKey;
 *      readonly attribute boolean         altKey;
 *      readonly attribute boolean         metaKey;
 *
 *      boolean            getModifierState(in DOMString keyIdentifierArg);
 *
 *      void               initKeyboardEvent(in DOMString typeArg,
 *                                     in boolean canBubbleArg,
 *                                     in boolean cancelableArg,
 *                                     in views::AbstractView viewArg,
 *                                     in DOMString keyIdentifierArg,
 *                                     in unsigned long keyLocationArg,
 *                                     in DOMString modifiersListArg);
 *
 *      void               initKeyboardEventNS(in DOMString namespaceURIArg,
 *                                        in DOMString typeArg,
 *                                        in boolean canBubbleArg,
 *                                        in boolean cancelableArg,
 *                                        in views::AbstractView viewArg,
 *                                        in DOMString keyIdentifierArg,
 *                                        in unsigned long keyLocationArg,
 *                                        in DOMString modifiersListArg);
 * };
 */
define(
	'spell/shared/util/platform/private/input/keyHandler',
	[
		'spell/functions'
	],
	function( _ ) {
		"use strict";

		var nativeHandler = null

		var nativeHandlerImpl = function( callback, event ) {
			event.preventDefault()

			callback( {
				type:       ( event.type == 'keyup' ) ? 'keyUp' : 'keyDown',
				keyCode:    event.keyCode
			} )
		}

		var registerListener = function( el, callback ) {
			nativeHandler = _.bind( nativeHandlerImpl, this, callback )

			el.addEventListener( 'keyup',   nativeHandler, true )
			el.addEventListener( 'keydown', nativeHandler, true )
		}

		var removeListener = function( el ) {
			if( nativeHandler !== null ) {
				el.removeEventLister( 'keyup',      nativeHandler )
				el.removeEventLister( 'keydown',    nativeHandler )
			}

			nativeHandler = null
		}

		return {
			registerListener: registerListener,
			removeListener: removeListener
		}
	}
)

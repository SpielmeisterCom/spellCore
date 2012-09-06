define(
	"spell/shared/util/platform/private/Input",
	[
		"spell/shared/util/input/keyCodes",
		"spell/math/util",

		'spell/functions'
	],
	function(
		keyCodes,
		mathUtil,

		_
	) {
		"use strict"


		/*
		 * private
		 */

		// for these key codes default handling is suppressed
		var preventDefaultKeyCodes = [
			keyCodes[ 'SPACE' ],
			keyCodes[ 'LEFT_ARROW' ],
			keyCodes[ 'UP_ARROW' ],
			keyCodes[ 'RIGHT_ARROW' ],
			keyCodes[ 'DOWN_ARROW' ]
		]

		var preventDefault = function( event ) {
			if( event.preventDefault ) {
				event.preventDefault()

			} else {
				event.returnValue = false
			}
		}

		/*
		 * Thanks to John Resig. http://ejohn.org/blog/flexible-javascript-events/
		 *
		 * @param obj
		 * @param type
		 * @param fn
		 */
		var addEvent = function( obj, type, fn ) {
		  if ( obj.attachEvent ) {
		    obj['e'+type+fn] = fn;
		    obj[type+fn] = function(){obj['e'+type+fn]( window.event );}
		    obj.attachEvent( 'on'+type, obj[type+fn] );
		  } else
		    obj.addEventListener( type, fn, false );
		}

		var isEventSupported = function( eventName ) {
			return _.has( nativeEventMap, eventName )
		}

		function getOffset( element ) {
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

		var nativeTouchHandler = function( callback, event ) {
			event.stopPropagation()
			preventDefault( event )

			var touch = event.changedTouches[ 0 ]
			var offset = getOffset( this.container )
			var screenSize = this.configurationManager.screenSize

			var position = [
				( touch.pageX - offset[ 0 ] ) / screenSize[ 0 ],
				( touch.pageY - offset[ 1 ] ) / screenSize[ 1 ]
			]

			// if the event missed the display it gets ignored
			if( !mathUtil.isInInterval( position[ 0 ], 0.0, 1.0 ) ||
				!mathUtil.isInInterval( position[ 1 ], 0.0, 1.0 ) ) {

				return
			}

			callback( {
				type     : event.type,
				position : position
			} )
		}

		var nativeKeyHandler = function( callback, event ) {
			if( _.contains( preventDefaultKeyCodes, event.keyCode ) ) {
				preventDefault( event )
			}

			callback( event )
		}

        var nativeMouseHandler = function( callback, event ) {
			var offset = getOffset( this.container )
			var screenSize = this.configurationManager.screenSize

			var position = [
				( event.pageX - offset[ 0 ] ) / screenSize[ 0 ],
				( event.pageY - offset[ 1 ] ) / screenSize[ 1 ]
			]

            // if the event missed the display it gets ignored
            if( !mathUtil.isInInterval( position[ 0 ], 0.0, 1.0 ) ||
                !mathUtil.isInInterval( position[ 1 ], 0.0, 1.0 ) ) {

                return
            }

            callback( {
                type     : event.type,
                position : position
            } )
        }

		/*
		 * maps the internal event name to to native event name and callback
		 */
		var nativeEventMap = {
            touchstart : {
                eventName : 'touchstart',
                handler   : nativeTouchHandler
            },
            touchend : {
                eventName : 'touchend',
                handler   : nativeTouchHandler
            },
			mousedown : {
				eventName : 'mousedown',
				handler   : nativeMouseHandler
			},
			mouseup : {
				eventName : 'mouseup',
				handler   : nativeMouseHandler
			},
			keydown : {
				eventName : 'keydown',
				handler   : nativeKeyHandler
			},
			keyup : {
				eventName : 'keyup',
				handler   : nativeKeyHandler
			}
		}


		/*
		 * public
		 */

		var Input = function( configurationManager ) {
			this.configurationManager = configurationManager
			this.container = document.getElementById( configurationManager.id )
		}

		var setListener = function( eventName, callback ) {
			if( !isEventSupported( eventName ) ) return

			var nativeEvent = nativeEventMap[ eventName ]

			addEvent( document.body, nativeEvent.eventName, _.bind( nativeEvent.handler, this, callback ) )
		}

		var removeListener = function( eventName ) {
			if( !isEventSupported( eventName ) ) return

			var nativeEvent = nativeEventMap[ eventName ]

			this.container[ 'on' + nativeEvent.eventName ] = null
		}

		Input.prototype = {
			setInputEventListener    : setListener,
			removeInputEventListener : removeListener
		}

		return Input
	}
)

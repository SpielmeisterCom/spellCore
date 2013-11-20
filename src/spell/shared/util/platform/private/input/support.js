define(
	'spell/shared/util/platform/private/input/support',
	[
		'spell/functions',
		'spell/shared/util/platform/private/input/deviceOrientationHandler',
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',
		'spell/shared/util/platform/private/environment/isHtml5GameClosure',
		'spell/shared/util/platform/private/registerTimer'
	],
	function(
		_,
		deviceOrientationHandler,
		isHtml5Ejecta,
		isHtml5GameClosure,
		registerTimer
	) {
		'use strict'


		var DEVICE_ORIENTATION_PROBING_TIMEOUT = 50

		var isBrokenDeviceOrientationApi = true

		return {
			hasPointerApi : function() {
				return window.navigator.pointerEnabled
			},
			hasMicrosoftPointerApi : function() {
				return window.navigator.msPointerEnabled
			},
			hasPointerTouchApi : function() {
				return ( 'msMaxTouchPoints' in window.navigator && window.navigator.msMaxTouchPoints > 0 ) ||
					( 'maxTouchPoints' in window.navigator && window.navigator.maxTouchPoints > 0 )
			},
			hasWebkitTouchApi : function() {
				return ( 'ontouchstart' in window ) || // webkit
					( window.DocumentTouch && document instanceof DocumentTouch ) || // Firefox Mobile
					isHtml5Ejecta
			},
			hasDeviceOrientationApi : function() {
				return isHtml5GameClosure ||
					( window.DeviceMotionEvent !== undefined && !isBrokenDeviceOrientationApi )
			},
			init : function( next ) {
				if( !isHtml5GameClosure && window.DeviceMotionEvent ) {
					var doneProbing = _.once( function() {
						deviceOrientationHandler.removeListener( window )

						next()
					} )

					var probeDeviceOrientationApi = function( event ) {
						if( event.gamma !== 0 ) {
							isBrokenDeviceOrientationApi = false
						}

						doneProbing()
					}

					registerTimer( doneProbing, DEVICE_ORIENTATION_PROBING_TIMEOUT )

					deviceOrientationHandler.registerListener( window, probeDeviceOrientationApi )

				} else {
					next()
				}
			}
		}
	}
)

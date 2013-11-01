define(
	'spell/shared/util/platform/private/input/support',
	[
		'spell/shared/util/platform/private/input/deviceOrientationHandler',
		'spell/shared/util/platform/private/isHtml5Ejecta'
	],
	function(
		deviceOrientationHandler,
		isHtml5Ejecta
	) {
		'use strict'

		var isBrokenDeviceOrientationApi = true

		if( window.DeviceMotionEvent ) {
			var NUM_SAMPLES                  = 10,
				counter                      = NUM_SAMPLES

			// Bad hack for detecting wrong api implementation ( for example on ipad1 )
			var checkIsBrokenDeviceOrientationApi = function( event ) {
				if( event.gamma !== 0 ) {
					isBrokenDeviceOrientationApi = false
				}

				if( !isBrokenDeviceOrientationApi || counter > 0 ) {
					deviceOrientationHandler.removeListener( window )
				}

				counter--
			}

			deviceOrientationHandler.registerListener( window, checkIsBrokenDeviceOrientationApi )
		}

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
				return window.DeviceMotionEvent !== undefined && !isBrokenDeviceOrientationApi
			}
		}
	}
)

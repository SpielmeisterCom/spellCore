define(
	'spell/shared/util/platform/private/input/support',
	[
		'spell/shared/util/platform/private/input/deviceOrientationHandler',
		'spell/shared/util/platform/private/isHtml5Ejecta',
		'spell/shared/util/platform/private/isHtml5GameClosure'
	],
	function(
		deviceOrientationHandler,
		isHtml5Ejecta,
		isHtml5GameClosure
	) {
		'use strict'


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
					var NUM_SAMPLES = 10,
						counter     = NUM_SAMPLES

					// HACK: probing for broken API implementation (i.e. mobile safari does not provide angles)
					var checkIsBrokenDeviceOrientationApi = function( event ) {
						if( event.gamma !== 0 ) {
							isBrokenDeviceOrientationApi = false
						}

						if( !isBrokenDeviceOrientationApi || counter < 0 ) {
							deviceOrientationHandler.removeListener( window )

							next()
						}

						counter--
					}

					deviceOrientationHandler.registerListener( window, checkIsBrokenDeviceOrientationApi )

				} else {
					next()
				}
			}
		}
	}
)

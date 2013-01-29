define(
	'spell/shared/util/platform/private/input/supportedPointerApi',
	function() {
		'use strict'


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
					( window.DocumentTouch && document instanceof DocumentTouch ) || // Firefox Mobile ?
					typeof( ejecta ) !== 'undefined' // ejecta
			}
		}
	}
)

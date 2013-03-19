define(
	'spell/shared/util/platform/private/input/supportedPointerApi',
	[
		'spell/shared/util/platform/private/isHtml5Ejecta'
	],
	function(
		isHtml5Ejecta
	) {
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
					( window.DocumentTouch && document instanceof DocumentTouch ) || // Firefox Mobile
					isHtml5Ejecta
			}
		}
	}
)

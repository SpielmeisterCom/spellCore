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
			hasWebkitTouchApi : function() {
				return ( 'ontouchstart' in window ) || // webkit
					( window.DocumentTouch && document instanceof DocumentTouch ) || // Firefox Mobile ?
					typeof( ejecta ) !== 'undefined' // nicht ejecta
			}
		}
	}
)

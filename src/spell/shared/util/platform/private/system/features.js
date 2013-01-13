define(
	"spell/shared/util/platform/private/system/features",
	[
	],
	function(
	) {
		"use strict"

		var hasTouchSupport = function() {
			return  ('ontouchstart' in window) ||
					( window.DocumentTouch && document instanceof DocumentTouch) ||
					( 'msMaxTouchPoints' in window.navigator && window.navigator.msMaxTouchPoints > 0 )
		}

		var touchSupport = true

		return {
			touch : touchSupport
		}
	}
)

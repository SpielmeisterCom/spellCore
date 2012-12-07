define(
	"spell/shared/util/platform/private/system/features",
	[
	],
	function(
	) {
		"use strict"

		var hasTouchSupport = function() {
			//return ('ontouchstart' in window) || ( window.DocumentTouch && document instanceof DocumentTouch)
			return false
		}


		var touchSupport = hasTouchSupport()

		return {
			touch : touchSupport
		}
	}
)

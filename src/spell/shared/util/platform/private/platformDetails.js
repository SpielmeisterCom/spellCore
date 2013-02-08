define(
	'spell/shared/util/platform/private/platformDetails',
	[
		'spell/shared/util/platform/private/input/supportedPointerApi'
	],
	function(
		supportedPointerApi
	) {
		'use strict'


		return {
			platformId : 'html5',
			hasPlentyRAM : function() { return true },
			hasTouchSupport : function() {
				return supportedPointerApi.hasWebkitTouchApi() ||
					supportedPointerApi.hasPointerTouchApi()
			}
		}
	}
)

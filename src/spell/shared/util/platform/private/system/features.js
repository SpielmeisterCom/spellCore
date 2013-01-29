define(
	'spell/shared/util/platform/private/system/features',
	[
		'spell/shared/util/platform/private/input/supportedPointerApi'
	],
	function(
		supportedPointerApi
	) {
		'use strict'


		return {
			hasTouchSupport : function() {
				return supportedPointerApi.hasPointerApi() ||
					supportedPointerApi.hasMicrosoftPointerApi() ||
					supportedPointerApi.hasWebkitTouchApi()
			}
		}
	}
)

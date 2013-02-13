define(
	'spell/shared/util/platform/private/platformDetails',
	[
		'spell/shared/util/platform/private/input/supportedPointerApi',
		'spell/shared/util/platform/private/isHtml5Ejecta'
	],
	function(
		supportedPointerApi,
		isHtml5Ejecta
	) {
		'use strict'


		return {
			hasPlentyRAM : function() {
                return !isHtml5Ejecta()
            },
			hasTouchSupport : function() {
				return supportedPointerApi.hasWebkitTouchApi() ||
					supportedPointerApi.hasPointerTouchApi()
			},
			getColorDepth: function() {
				return screen.colorDepth
			},
			getOS : function() {
				return navigator.platform
			},
			getPlatformAdapter : function() {
				return 'html5'
			},
			getPlatform : function() {
				return navigator.userAgent
			},
			getScreenHeight: function() {
				return screen.height
			},
			getScreenWidth: function() {
				return screen.width
			}
		}
	}
)

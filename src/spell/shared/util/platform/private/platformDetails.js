define(
	'spell/shared/util/platform/private/platformDetails',
	[
		'spell/shared/util/platform/private/input/supportedPointerApi',
		'spell/shared/util/platform/private/isHtml5CocoonJS',
		'spell/shared/util/platform/private/isHtml5Ejecta'
	],
	function(
		supportedPointerApi,
		isHtml5CocoonJS,
		isHtml5Ejecta
	) {
		'use strict'


		return {
			hasPlentyRAM : function() {
                return !isHtml5CocoonJS && !isHtml5Ejecta
            },
			hasTouchSupport : function() {
				return supportedPointerApi.hasWebkitTouchApi() ||
					supportedPointerApi.hasPointerTouchApi()
			},
			getOS : function() {
				if( isHtml5CocoonJS ) {
					var userAgentParts = navigator.userAgent.split( ',' )

					return userAgentParts[ 0 ] + ' ' + userAgentParts[ 1 ].trim()

				} else {
					return navigator.platform
				}
			},
			getPlatformAdapter : function() {
				return isHtml5CocoonJS ?
					'CocoonJS' :
					isHtml5Ejecta ?
						'Ejecta' :
						'html5'
			},
			getPlatform : function() {
				return isHtml5CocoonJS ?
					navigator.appVersion :
					navigator.userAgent
			},
			getDevice : function() {
				return isHtml5CocoonJS ?
					navigator.platform :
					'unknown'
			},
			getScreenHeight: function() {
				return screen.height
			},
			getScreenWidth: function() {
				return screen.width
			},
			isMobileDevice: function() {
				return isHtml5CocoonJS || isHtml5Ejecta
			}
		}
	}
)

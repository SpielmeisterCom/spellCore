define(
	'spell/shared/util/platform/private/platformDetails',
	[
		'spell/shared/util/platform/private/input/support',
		'spell/shared/util/platform/private/isHtml5CocoonJS',
		'spell/shared/util/platform/private/isHtml5Ejecta',
		'spell/shared/util/platform/private/isHtml5GameClosure',
		'spell/shared/util/platform/private/jsonCoder'
	],
	function(
		support,
		isHtml5CocoonJS,
		isHtml5Ejecta,
		isHtml5GameClosure,
		jsonCoder
	) {
		'use strict'


		if( isHtml5GameClosure ) {
			var gameClosureDeviceInfo = jsonCoder.decode( NATIVE.device.native_info )
		}

		return {
			hasPlentyRAM : function() {
                return !( isHtml5CocoonJS || isHtml5Ejecta || isHtml5GameClosure )
            },
			hasTouchSupport : function() {
				return support.hasWebkitTouchApi() ||
					support.hasPointerTouchApi()
			},
			hasDeviceOrientationSupport : support.hasDeviceOrientationSupport,
			getOS : function() {
				if( isHtml5CocoonJS ) {
					var userAgentParts = navigator.userAgent.split( ',' )

					return userAgentParts[ 0 ] + ' ' + userAgentParts[ 1 ].trim()

				} else if( isHtml5Ejecta ) {
					return 'iOS ' + navigator.userAgent.match( /([\.\d]+)\)$/ )[ 1 ]

				} else if( isHtml5GameClosure ) {
					return 'Android ' + gameClosureDeviceInfo.versionRelease

				}else {
					return navigator.platform
				}
			},
			getPlatformAdapter : function() {
				if( isHtml5CocoonJS ) return 'cocoonjs'
				if( isHtml5Ejecta ) return 'ejecta'
				if( isHtml5GameClosure ) return 'gameclosure'

				return 'html5'
			},
			getPlatform : function() {
				if( isHtml5CocoonJS ) return navigator.appVersion

				return navigator.userAgent
			},
			getDevice : function() {
				if( isHtml5CocoonJS ) return navigator.platform
				if( isHtml5Ejecta ) return navigator.userAgent.match( /\((.*);/ )[ 1 ]
				if( isHtml5GameClosure ) return gameClosureDeviceInfo.model + ', ' + gameClosureDeviceInfo.manufacturer

				return 'unknown'
			},
			getScreenHeight: function() {
				return screen.height
			},
			getScreenWidth: function() {
				return screen.width
			},
			isMobileDevice: function() {
				return isHtml5CocoonJS || isHtml5Ejecta || isHtml5GameClosure
			}
		}
	}
)

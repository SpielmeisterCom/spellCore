define(
	'spell/shared/util/platform/private/platformDetails',
	[
		'spell/shared/util/platform/private/input/support',
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',
		'spell/shared/util/platform/private/environment/isHtml5TeaLeaf',
		'spell/shared/util/platform/private/environment/isHtml5Tizen',
		'spell/shared/util/platform/private/environment/isHtml5WinPhone',
		'spell/shared/util/platform/private/environment/isHtml5WinStore',
        'spell/shared/util/platform/private/environment/hasGameControllerSupport',
		'spell/shared/util/platform/private/jsonCoder'
	],
	function(
		support,
		isHtml5Ejecta,
		isHtml5TeaLeaf,
		isHtml5Tizen,
		isHtml5WinPhone,
		isHtml5WinStore,
        hasGameControllerSupport,
		jsonCoder
	) {
		'use strict'


		if( isHtml5TeaLeaf ) {
			var gameClosureDeviceInfo = jsonCoder.decode( NATIVE.device.native_info )
		}

		return {
			hasPlentyRAM : function() {
                return !isHtml5Ejecta
            },
			hasTouchSupport : function() {
				return support.hasWebkitTouchApi() ||
					support.hasPointerTouchApi()
			},
			hasDeviceOrientationSupport : support.hasDeviceOrientationApi,
			getOS : function() {
				if( isHtml5Ejecta ) {
					return 'iOS ' + navigator.userAgent.match( /([\.\d]+)\)$/ )[ 1 ]

				} else if( isHtml5TeaLeaf ) {
					return 'Android ' + gameClosureDeviceInfo.versionRelease

				} else {
					return navigator.platform
				}
			},
			getPlatformAdapter : function() {
				if( isHtml5Ejecta ) return 'ejecta'
				if( isHtml5TeaLeaf ) return 'gameclosure'

				return 'html5'
			},
			getPlatform : function() {
				return navigator.userAgent
			},
			getTarget : function() {
				if( isHtml5Ejecta ) return 'ios'
				if( isHtml5TeaLeaf ) return 'android'
				if( isHtml5Tizen ) return 'tizen'
				if( isHtml5WinPhone ) return 'winphone'
				if( isHtml5WinStore ) return 'winstore'

				return 'web'
			},
			getDevice : function() {
				if( isHtml5Ejecta ) return navigator.userAgent.match( /\((.*);/ )[ 1 ]
				if( isHtml5TeaLeaf ) return gameClosureDeviceInfo.model + ', ' + gameClosureDeviceInfo.manufacturer

				return 'unknown'
			},
			getScreenHeight: function() {
				return screen.height
			},
			getScreenWidth: function() {
				return screen.width
			},
			isMobileDevice: function() {
				return isHtml5Ejecta || isHtml5TeaLeaf
			},
            hasGameControllerSupport: function() {
                return hasGameControllerSupport
            }
		}
	}
)

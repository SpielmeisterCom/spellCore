define(
	'spell/shared/util/platform/private/platformDetails',
	[
		'spell/shared/util/platform/private/input/supportedPointerApi'
	],
	function(
		supportedPointerApi
	) {
		'use strict'

		//For html5 only. Parse userAgent etc.
		var getBrowser = function() {
			var N= navigator.appName, ua= navigator.userAgent, tem;
			var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
			if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
			M= M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];

			return M;
		}

		return {
			platformId : 'html5',
			hasPlentyRAM : function() { return true },
			hasTouchSupport : function() {
				return supportedPointerApi.hasWebkitTouchApi() ||
					supportedPointerApi.hasPointerTouchApi()
			},
			getScreenHeight: function() {
				return screen.height
			},
			getScreenWidth: function() {
				return screen.width
			},
			getColorDepth: function() {
				return screen.colorDepth
			},
			getRuntime: function() {
				return {
					version: browser[1],
					name   : browser[0]
				}
			}
		}
	}
)

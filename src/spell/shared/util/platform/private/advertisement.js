define(
	'spell/shared/util/platform/private/advertisement',
	[
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',
		'spell/shared/util/platform/private/environment/isHtml5GameClosure'
	],
	function(
		isHtml5Ejecta,
		isHtml5GameClosure
	) {
		'use strict'


		return {
			loadInterstitial : function() {
				if( isHtml5Ejecta ) {
					ejecta.loadInterstitial()

				} else if( isHtml5GameClosure ) {
					NATIVE.advertisement.loadInterstitial()
				}
			},
			showInterstitial : function() {
				if( isHtml5Ejecta ) {
					ejecta.showInterstitial()

				} else if( isHtml5GameClosure ) {
					NATIVE.advertisement.showInterstitial()
				}
			}
		}
	}
)

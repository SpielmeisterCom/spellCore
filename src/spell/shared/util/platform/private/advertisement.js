define(
	'spell/shared/util/platform/private/advertisement',
	[
		'spell/shared/util/platform/private/environment/isHtml5CocoonJS',
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',
		'spell/shared/util/platform/private/environment/isHtml5GameClosure'
	],
	function(
		isHtml5CocoonJS,
		isHtml5Ejecta,
		isHtml5GameClosure
	) {
		'use strict'


		return {
			loadInterstitial : function() {
				if( isHtml5CocoonJS ) {
					CocoonJS.Ad.preloadFullScreen()

				} else if( isHtml5Ejecta ) {
					ejecta.loadInterstitial()

				} else if( isHtml5GameClosure ) {
					NATIVE.advertisement.loadInterstitial()
				}
			},
			showInterstitial : function() {
				if( isHtml5CocoonJS ) {
					CocoonJS.Ad.setBannerLayout( CocoonJS.Ad.BannerLayout.TOP_CENTER )
					CocoonJS.Ad.showFullScreen()

				} else if( isHtml5Ejecta ) {
					ejecta.showInterstitial()

				} else if( isHtml5GameClosure ) {
					NATIVE.advertisement.showInterstitial()
				}
			}
		}
	}
)

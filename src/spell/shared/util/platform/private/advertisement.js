define(
	'spell/shared/util/platform/private/advertisement',
	[
		'spell/shared/util/platform/private/isHtml5Ejecta',
		'spell/shared/util/platform/private/isHtml5CocoonJS'
	],
	function(
		isHtml5Ejecta,
		isHtml5CocoonJS
	) {
		'use strict'


		return {
			loadInterstitial : function() {
				if( isHtml5Ejecta ) {
					ejecta.loadInterstitial()

				} else if( isHtml5CocoonJS ) {
					CocoonJS.Ad.preloadFullScreen()
				}
			},
			showInterstitial : function() {
				if( isHtml5Ejecta ) {
					ejecta.showInterstitial()

				} else if( isHtml5CocoonJS ) {
					CocoonJS.Ad.setBannerLayout( CocoonJS.Ad.BannerLayout.TOP_CENTER )
					CocoonJS.Ad.showFullScreen()
				}
			}
		}
	}
)

define(
	'spell/shared/util/platform/private/advertisement',
	[
		'spell/shared/util/platform/private/isHtml5CocoonJS'
	],
	function(
		isHtml5CocoonJS
	) {
		'use strict'


		return {
			showAdBanner : function() {
				if( !isHtml5CocoonJS() ) return

				CocoonJS.Ad.preloadBanner()
				CocoonJS.Ad.setBannerLayout( CocoonJS.Ad.BannerLayout.TOP_CENTER )
				CocoonJS.Ad.showBanner()
			},

			hideAdBanner : function() {
				if( !isHtml5CocoonJS() ) return

				CocoonJS.Ad.hideBanner()
			}
		}
	}
)

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
				if( !isHtml5CocoonJS ) return

				CocoonJS.Ad.setBannerLayout( CocoonJS.Ad.BannerLayout.TOP_CENTER )
				CocoonJS.Ad.showFullScreen()

				CocoonJS.Ad.preloadFullScreen()
			},

			hideAdBanner : function() {
				if( !isHtml5CocoonJS ) return

				CocoonJS.Ad.hideBanner()
			}
		}
	}
)

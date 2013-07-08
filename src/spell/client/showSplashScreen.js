define(
	'spell/client/showSplashScreen',
	[
		'spell/math/vec2',
		'spell/shared/util/platform/PlatformKit'
	],
	function(
		vec2,
		PlatformKit
	) {
		'use strict'


		return function( spell, next ) {
			var libraryFilePath = 'spell/splash.png'

			spell.libraryManager.load(
				[
					libraryFilePath
				],
				{
					name : 'splashScreen',
					isMetaDataLoad : false
				},
				function() {
					var splashTexture = spell.libraryManager.get( libraryFilePath ),
						screenSize    = spell.configurationManager.getValue( 'currentScreenSize' )

					var position = vec2.fromValues(
						Math.round( screenSize[ 0 ] * 0.5 - splashTexture.dimensions[ 0 ] * 0.5 ),
						Math.round( screenSize[ 1 ] * 0.5 - splashTexture.dimensions[ 1 ] * 0.5 )
					)

					spell.renderingContext.drawTexture( splashTexture, position, splashTexture.dimensions )

					PlatformKit.registerTimer( next, 2000 )
				}
			)
		}
	}
)

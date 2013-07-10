define(
	'spell/client/showSplashScreen',
	[
		'spell/math/mat3',
		'spell/math/util',
		'spell/math/vec2',
		'spell/math/vec4',
		'spell/shared/util/platform/PlatformKit'
	],
	function(
		mat3,
		mathUtil,
		vec2,
		vec4,
		PlatformKit
	) {
		'use strict'


		var createRGB = function( dataRGBA ) {
			var numPixels = dataRGBA.length / 4,
				dataRGB   = new Array( numPixels * 3 )

			for( var i = 0, srcOffset, dstOffset, n = numPixels; i < n; i ++ ) {
				srcOffset = i * 4
				dstOffset = i * 3

				dataRGB[ dstOffset ]     = dataRGBA[ srcOffset ]
				dataRGB[ dstOffset + 1 ] = dataRGBA[ srcOffset + 1 ]
				dataRGB[ dstOffset + 2 ] = dataRGBA[ srcOffset + 2 ]
			}

			return dataRGB
		}

		return function( spell, next ) {
			var splashTexture = spell.renderingContext.createTexture( PlatformKit.createSplashScreenImage() ),
				screenSize    = spell.configurationManager.getValue( 'currentScreenSize' )

			var position = vec2.fromValues(
				Math.round( screenSize[ 0 ] * 0.5 - splashTexture.dimensions[ 0 ] * 0.5 ),
				Math.round( screenSize[ 1 ] * 0.5 - splashTexture.dimensions[ 1 ] * 0.5 )
			)

			var context    = spell.renderingContext,
				tmpMat3    = mat3.create(),
				clearColor = vec4.fromValues( 0, 0, 0, 1 )

			mathUtil.mat3Ortho( tmpMat3, 0.0, screenSize[ 0 ], 0.0, screenSize[ 1 ] )

			context.setViewMatrix( tmpMat3 )
			context.setClearColor( clearColor )
			context.resizeColorBuffer( screenSize[ 0 ], screenSize[ 1 ] )
			context.viewport( 0, 0, screenSize[ 0 ], screenSize [ 1 ] )

			context.drawTexture( splashTexture, position, splashTexture.dimensions, null )

			PlatformKit.registerTimer( next, 3000 )
		}
	}
)

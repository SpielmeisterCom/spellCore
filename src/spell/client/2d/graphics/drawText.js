define(
	'spell/client/2d/graphics/drawText',
	function() {
		'use strict'


		var drawCharacter = function( context, texture, dx, dy, charData, spacing ) {
			var width  = charData.width,
				height = charData.height

			context.drawSubTexture(
				texture,
				charData.x,
				charData.y,
				width,
				height,
				dx,
				dy,
				width,
				height
			)

			return charData.width + spacing
		}

		return function( context, fontAsset, fontTexture, dx, dy, text ) {
			text = text.toString()

			var numCharacters = text.length,
				charset       = fontAsset.config.charset,
				spacing       = fontAsset.config.spacing

			for( var i = 0; i < numCharacters; i++ ) {
				var charData = charset[ text[ i ] ]

				// in case of unsupported character perform a fallback
				if( !charData ) {
					charData = charset[ ' ' ]
				}

				dx += drawCharacter( context, fontTexture, dx, dy, charData, spacing )
			}
		}
    }
)

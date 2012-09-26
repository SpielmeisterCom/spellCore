define(
	'spell/client/2d/graphics/drawText',
	function() {
		'use strict'


		/**
		 * Draws a character on a context.
		 *
		 * @param context
		 * @param texture
		 * @param charData
		 * @param dx
		 * @param dy
		 * @param spacing the actual spacing to be used
		 * @param fontMapSpacing the fake spacing introduced by the font map
		 */
		var drawCharacter = function( context, texture, charData, dx, dy, spacing, fontMapSpacing ) {
			var doubledFontMapSpacing = fontMapSpacing * 2,
				width                 = charData.width,
				height                = charData.height

			context.drawSubTexture(
				texture,
				charData.x - fontMapSpacing,
				charData.y,
				width + doubledFontMapSpacing,
				height,
				dx - fontMapSpacing,
				dy,
				width + doubledFontMapSpacing,
				height
			)

			return charData.width + spacing + fontMapSpacing
		}

		return function( context, fontAsset, fontTexture, dx, dy, text, spacing ) {
			spacing = spacing || 0
			text    = text.toString()

			var numCharacters  = text.length,
				charset        = fontAsset.config.charset,
				fontMapSpacing = fontAsset.config.spacing

			for( var i = 0; i < numCharacters; i++ ) {
				var charData = charset[ text.charAt( i ) ]

				// in case of unsupported character perform a fallback
				if( !charData ) {
					charData = charset[ ' ' ]
				}

				dx += drawCharacter( context, fontTexture, charData, dx, dy, spacing, fontMapSpacing )
			}
		}
    }
)

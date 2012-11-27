define(
	'spell/client/2d/graphics/drawText',
	[
		'spell/math/vec2'
	],
	function(
		vec2
	) {
		'use strict'


		var sourcePosition      = vec2.create(),
			destinationPosition = vec2.create(),
			dimensions          = vec2.create()

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
			sourcePosition[ 0 ] = charData.x - fontMapSpacing
			sourcePosition[ 1 ] = charData.y

			destinationPosition[ 0 ] = dx - fontMapSpacing
			destinationPosition[ 1 ] = dy

			dimensions[ 0 ] = charData.width + fontMapSpacing * 2
			dimensions[ 1 ] = charData.height

			context.drawSubTexture(
				texture,
				sourcePosition,
				dimensions,
				destinationPosition,
				dimensions
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

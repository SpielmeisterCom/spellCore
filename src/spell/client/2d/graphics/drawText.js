define(
	'spell/client/2d/graphics/drawText',
	function() {
		'use strict'


		var drawCharacter = function( context, texture, dx, dy, charInfo ) {
			var width  = charInfo.width,
				height = charInfo.height

			context.drawSubTexture(
				texture,
				charInfo.x,
				charInfo.y,
				width,
				height,
				dx,
				dy,
				width,
				height
			)

			return charInfo.width
		}

		return function( context, fontAsset, fontTexture, dx, dy, text ) {
			text = text.toString()

			var numCharacters = text.length,
				charset       = fontAsset.config.charset,
				spacing       = fontAsset.config.spacing

			for( var i = 0; i < numCharacters; i++ ) {
				dx += drawCharacter( context, fontTexture, dx, dy, charset[ text[ i ] ] ) + spacing
			}
		}
    }
)

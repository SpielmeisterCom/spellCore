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

		return function( context, resources, font, dx, dy, text ) {
			text = text.toString()

			var numCharacters = text.length,
				texture       = resources[ font.resourceId ],
				charset       = font.charset

			for( var i = 0; i < numCharacters; i++ ) {
				dx += drawCharacter( context, texture, dx, dy, charset[ text[ i ] ] )
			}
		}
    }
)

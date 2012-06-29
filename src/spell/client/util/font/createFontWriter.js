define(
	"spell/client/util/font/createFontWriter",
	function() {
		"use strict"


		/*
		 * NOTE: The code that deals with text rendering should not know anything about world scaling or screen dimensions. It should only blit text on a
		 * texture which can then be used to do the actual drawing on the color buffer.
		 */

		//TODO: get constants from a global configuration
		var constants = {
			"xSize" : 1024,
			"ySize" : 768
		}

        var FontWriter = function( font, bitmap ) {

            var getCharInfo = function( char ) {
                return font.chars[ char ]
            }

            var drawChar = function( context, char, rgbColor, scale, posX, posY ) {

                var charInfo = getCharInfo( char )

                var sx = parseInt( charInfo.x ),
                    sy = parseInt( charInfo.y ),
                    sw = parseInt( charInfo.width ),
                    sh = parseInt( charInfo.height ),
                    dx = parseInt( posX ) + charInfo.xoffset * scale,
                    dy = constants.ySize - ( parseInt( posY ) + sh + charInfo.yoffset * scale ),
                    dw = charInfo.width * scale,
                    dh = charInfo.height * scale

                context.drawSubTexture( bitmap, sx, sy, sw, sh, dx, dy, dw, dh )

//                colorize( context, rgbColor, dx, dy, dw, dh )
            }

            var colorize = function( context, rgbColor, x, y, width, height ) {

                var imgdata = context.getImageData(
                    x,
                    y,
                    width,
                    height
                )

                var pixel = imgdata.data

                for ( var i = 0; i < pixel.length; i += 4 ) {
                    pixel[ i   ] = rgbColor[ 0 ] * pixel[ i   ]
                    pixel[ i+1 ] = rgbColor[ 1 ] * pixel[ i+1 ]
                    pixel[ i+2 ] = rgbColor[ 2 ] * pixel[ i+2 ]
                }

                context.putImageData( imgdata, x, y )
            }

            var drawString = function( context, string, rgbColor, scale, position ) {

                var stringified = string.toString()
                var posXOffset  = 0

                for( var i = 0; i < stringified.length; i++ ) {

                    var charCode = stringified.charCodeAt( i )

                    drawChar(
                        context,
                        charCode,
                        rgbColor,
                        scale,
                        position[ 0 ] + posXOffset,
                        position[ 1 ]
                    )

                    posXOffset += parseInt( getCharInfo( charCode ).xadvance ) * scale
                }

                return posXOffset
            }

            return {
                drawString: drawString
            }
        }

        return FontWriter
    }
)

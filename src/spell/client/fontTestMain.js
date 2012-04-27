define(
	"spell/client/fontTestMain",
    [
        "spell/client/util/font/fonts/Batang",
        "spell/client/util/font/fonts/BelloPro",
        "spell/client/util/font/createFontWriter"
    ],
	function(
        Batang,
        BelloPro,
        createFontWriter
	) {
		"use strict"

        var canvas = document.createElement('canvas')
        canvas.height = 600
        canvas.width  = 800
        document.getElementById("display0").appendChild( canvas )


        var context = canvas.getContext('2d')
        var ttfBitmap = new Image( )
        ttfBitmap.src = BelloPro.image

        var fontWriter = createFontWriter( BelloPro, ttfBitmap )

        ttfBitmap.onload = function() {

            var rgbColor = [
                1,
                0,
                0
            ]

            fontWriter.drawString(
                context,
                "Spielmeister",
                rgbColor,
                1,
                0,
                0
            )
        }

	}
)

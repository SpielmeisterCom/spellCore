define(
	[
		"spell/client/util/loadImages"
	],
	function(
		loadImages
	) {
		"use strict"
		
		
		describe( "loadImages", function() {
			it( "should load the images and pass them to the callback.", function() {
				var images
				loadImages(
					"specs/resources",
					[
						"1x1red.png",
						"sub/1x1green.png"
					],
					function( loadedImages ) {
						images = loadedImages
					}
				)
				
				waitsFor( function() {
					return images !== undefined
				} )
				
				runs( function() {
					var redContext   = create2dContext()
					var greenContext = create2dContext()

					redContext  .drawImage( images[ "1x1red.png"      ], 0, 0 )
					greenContext.drawImage( images[ "sub/1x1green.png"], 0, 0 )
					
					expect( pixelOf( redContext   ) ).toEqual( [ 255, 0  , 0, 255 ] )
					expect( pixelOf( greenContext ) ).toEqual( [ 0  , 255, 0, 255 ] )
				} )
			} )
		} )
		
		
		function create2dContext() {
			var canvas = document.createElement( "canvas" )
			canvas.width  = 1
			canvas.height = 1
			
			return canvas.getContext( "2d" )
		}
		
		function pixelOf( context ) {
			var imageData = context.getImageData( 0, 0, 1, 1 ).data
			return [ imageData[ 0 ], imageData[ 1 ], imageData[ 2 ], imageData[ 3 ] ]
		}
	}
)

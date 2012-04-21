
define(
	[
		"spell/util/browser/rendering/loadImagesAndPassTo"
	],
	function(
		loadImagesAndPassTo
	) {
	
		describe( "loadImagesAndPassTo", function() {
		
			beforeEach( function() {
				this.addMatchers( {
					toEndWith: function( other ) {
						var regExp = new RegExp( other + "$" );
						return this.actual.match( regExp );
					}
				} );
			} );
			
			it( "should load a complete image if the image information only contains a path.", function() {
				var imageInformation = {
					imageA: {
						path: "specs/resources/test-image-a.png"
					},
					imageB: {
						path: "specs/resources/test-image-b.png"
					}
				};
				
				var callbackWasCalled = false;
				var images = null;
				loadImagesAndPassTo( imageInformation, function( loadedImages ) {
					callbackWasCalled = true;
					images = loadedImages;
				} );
				
				waitsFor( function() {
					return callbackWasCalled;
				}, "callback function.", 1000 );
				
				runs( function() {
					var imageA = images[ "imageA" ];
					var imageB = images[ "imageB" ];
					
					expect( imageA.width ).toEqual( 8 );
					expect( imageA.height ).toEqual( 8 );
					expect( firstPixelOf( imageA ) ).toEqual( [ 0, 0, 0, 255 ] );
					expect( lastPixelOf( imageA ) ).toEqual( [ 0, 0, 255, 255 ] );
					
					expect( imageB.width ).toEqual( 8 );
					expect( imageB.height ).toEqual( 8 );
					expect( firstPixelOf( imageB ) ).toEqual( [ 255, 0, 0, 255 ] );
					expect( lastPixelOf( imageB ) ).toEqual( [ 255, 255, 255, 255 ] );
				} );
			} );
			
			it( "should load parts of an image if a position and size is specified.", function() {
				var imageInformation = {
					imageA: {
						path: "specs/resources/test-image-a.png",
						x: 0,
						y: 0,
						width: 4,
						height: 4
					},
					imageB: {
						path: "specs/resources/test-image-b.png",
						x: 4,
						y: 4,
						width: 4,
						height: 4
					}
				};
				
				var callbackWasCalled = false;
				var images = null;
				loadImagesAndPassTo( imageInformation, function( loadedImages ) {
					callbackWasCalled = true;
					images = loadedImages;
				} );
				
				waitsFor( function() {
					return callbackWasCalled;
				}, "callback function.", 1000 );
				
				runs( function() {
					var imageA = images[ "imageA" ];
					var imageB = images[ "imageB" ];
					
					expect( imageA.width ).toEqual( 4 );
					expect( imageA.height ).toEqual( 4 );
					expect( firstPixelOf( imageA ) ).toEqual( [ 0, 0, 0, 255 ] );
					expect( lastPixelOf( imageA ) ).toEqual( [ 0, 0, 0, 255 ] );
					
					expect( imageB.width ).toEqual( 4 );
					expect( imageB.height ).toEqual( 4 );
					expect( firstPixelOf( imageB ) ).toEqual( [ 255, 255, 255, 255 ] );
					expect( lastPixelOf( imageB ) ).toEqual( [ 255, 255, 255, 255 ] );
				} );
			} );
		} );
		
		
		
		function firstPixelOf( image ) {
			var imageData = getImageData( image );
			return [ imageData[ 0 ], imageData[ 1 ], imageData[ 2 ], imageData[ 3 ] ];
		}
		
		function lastPixelOf( image ) {
			var imageData = getImageData( image );
			var lastIndex = image.width * image.height * 4;
			
			return [ imageData[ lastIndex - 4 ], imageData[ lastIndex - 3 ], imageData[ lastIndex - 2 ],
					imageData[ lastIndex - 1 ] ];
		}
		
		function getImageData( image ) {
			var canvas = document.createElement( "canvas" );
			canvas.width = image.width;
			canvas.height = image.height;
			var context = canvas.getContext( "2d" );
					
			context.drawImage( image, 0, 0 );
			
			return context.getImageData( 0, 0, image.width, image.width ).data;
		}
	}
)

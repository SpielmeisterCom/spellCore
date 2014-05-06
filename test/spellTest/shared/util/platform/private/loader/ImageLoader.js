define(
	[
		'spell/shared/util/platform/private/loader/ImageLoader'
	],
	function(
		ImageLoader
	) {
		'use strict'


		var renderingContextMock = {
			createTexture: function( image ) {
				image.should.be.instanceof( HTMLImageElement )

				return {
					src: image.src
				}
			}
		}
		var imageLoader = new ImageLoader( renderingContextMock )

		describe( 'ImageLoader', function( ) {
			it( 'should load images and create textures from it', function( done ) {
				imageLoader.load( 'data/defaultAppearance.png', function( err, data ) {
					should.not.exist( err )
					should.exist( data )

					data.should.have.property( 'src' )
					done()
				} )
			})

			it( 'should fail on non existent image', function( done ) {
				imageLoader.load( 'data/non-existent.png', function( err, data ) {

					should.exist( err )
					should.not.exist( data )

					done()
				} )
			})
		})
})

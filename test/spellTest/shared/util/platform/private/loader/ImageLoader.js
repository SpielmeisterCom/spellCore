define(
	'spellTest/shared/util/platform/private/loader/ImageLoader',
	[
		'chai',
		'spell/shared/util/platform/private/loader/ImageLoader'
	],
	function(
		chai,
		ImageLoader
	) {
		'use strict'

		return function( describe, it ) {
			var assert = chai.assert,
				should = chai.should(),
				expect = chai.expect

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
				it( 'should correctly load images and create textures from it', function( done ) {
					imageLoader.load( 'data/defaultAppearance.png', function( err, data ) {
						should.not.exist( err )
						should.exist( data )

						data.should.have.property( 'src' )
					} )

					imageLoader.load( 'data/defaultAppearance.png', function( err, data ) {
						should.not.exist( err )
						should.exist( data )

						data.should.have.property( 'src' )
						done()
					} )
				})

				it( 'should correctly fail on non existent image', function( done ) {
					imageLoader.load( 'data/non-existent.png', function( err, data ) {

					should.exist( err )
					should.not.exist( data )

					done()
				} )

			})
		})

	}
})

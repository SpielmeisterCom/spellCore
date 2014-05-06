define(
	[
		'spell/shared/util/platform/private/loader/SoundLoader'
	],
	function(
		SoundLoader
	) {
		'use strict'

		var audioContextMock = {
			loadBuffer: function( url, isMusic, loadCallback ) {
				url.should.be.a( 'string')
				isMusic.should.be.a( 'boolean' )
				loadCallback.should.be.a( 'function' )

				loadCallback({
					//mock object
				})
			},

			createSound: function( buffer ) {
				buffer.should.be.a( 'object' )

				return {}
			}
		}


		var soundLoader = new SoundLoader( audioContextMock )

		describe( 'spell/shared/util/platform/private/loader/SoundLoader', function( ) {
			it( 'should load music (using audioContext)', function( done ) {
				soundLoader.load( true, 'data/music.mp3', function( err, data ) {
					should.not.exist( err )
					should.exist( data )

					done()
				} )
			})

			it( 'should load sound effects (using audioContext)', function( done ) {
				soundLoader.load( false, 'data/non-existent.png', function( err, data ) {

					should.not.exist( err )
					should.exist( data )

					data.should.be.a( 'object' )

					done()
				} )

			})
		})
})

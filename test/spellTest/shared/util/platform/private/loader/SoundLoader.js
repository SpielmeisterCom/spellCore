define(
	'spellTest/shared/util/platform/private/loader/SoundLoader',
	[
		'chai',
		'spell/shared/util/platform/private/loader/SoundLoader'
	],
	function(
		chai,
		SoundLoader
	) {
		'use strict'

		return function( describe, it ) {
			var assert = chai.assert,
				should = chai.should(),
				expect = chai.expect

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

			describe( 'SoundLoader', function( ) {
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

	}
})

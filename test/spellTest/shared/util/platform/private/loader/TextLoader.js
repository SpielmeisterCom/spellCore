define(
	'spellTest/shared/util/platform/private/loader/TextLoader',
	[
		'chai',
		'spell/shared/util/platform/private/loader/TextLoader'
	],
	function(
		chai,
		TextLoader
	) {
		'use strict'

		return function( describe, it ) {
			var assert = chai.assert,
				should = chai.should(),
				expect = chai.expect

			var textLoader = new TextLoader()

			describe( 'TextLoader', function( ) {
				it( 'should load text files', function( done ) {
					textLoader.load( 'data/test.txt', function( err, data ) {

						should.not.exist( err )
						expect( data ).to.be.equal( "Hello World\n" )
					} )

					done()
				})

				it( 'should fail on non existing files', function( done ) {
					textLoader.load( 'data/non-existent.txt', function( err, data ) {

						should.exist( err )
						should.not.exist( data )
					} )

					done()
				})

		})
	}
})

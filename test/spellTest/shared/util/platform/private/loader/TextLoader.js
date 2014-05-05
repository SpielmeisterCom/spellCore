define(
	[
		'spell/shared/util/platform/private/loader/TextLoader'
	],
	function(
		TextLoader
	) {
		'use strict'


		var textLoader = new TextLoader()

		describe( 'TextLoader', function( ) {
			it( 'should load text files', function( done ) {
				textLoader.load( 'data/test.txt', function( err, data ) {

					expect( err ).to.not.exist
					expect( data ).to.be.equal( "Hello World\r\n" )

					done()
				} )
			})

			it( 'should fail on non existing files', function( done ) {
				textLoader.load( 'data/non-existent.txt', function( err, data ) {

					expect( err ).to.exist
					expect( data ).to.not.exist

					done()
				} )
			})

		})
})

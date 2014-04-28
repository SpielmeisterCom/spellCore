define(
	'spellTest/LibraryManager',
	[
		'chai',
		'spell/LibraryManager'
	],
	function(
		chai,
		LibraryManager
	) {
		'use strict'

		return function( describe, it ) {
			var expect = chai.expect

			var requestManagerMock = {
                get : function( url, callback, forceType ) {

                }
            }

            var eventManagerMock = {

            }

            var libraryUrl      = "library",
                isModeDeployed  = false

			var libraryManager = new LibraryManager(
                eventManagerMock,
                requestManagerMock,
                libraryUrl,
                isModeDeployed
            )

			describe( 'LibraryManager', function( ) {

                it( 'should load a scene and it\'s dependencies', function( done ) {
                    libraryManager.load( [
                        'test.Scene'
                    ], true, true, function( err, data ) {

                        expect( err ).to.not.exist
                        expect( data ).to.exists

                        //expect( data ).to.be.a( 'object' )
                        //expect( data ).to.have.property( 'isa', 'imageMock' )

                        done()
                    } )
                })
		})

	}
})

define(
	[
		'spell/RequestManager'
	],
	function(
		RequestManager
	) {
		'use strict'

			var imageLoaderMock = {
				load: function( url, callback ) {
					expect( url ).to.be.a( 'string' )
					expect( callback ).to.be.a( 'function' )

					callback(
						null,
						{
							isa : 'imageMock'
						}
					)
				}
			}

			var soundLoaderMock = {
				load: function( url, isMusic, loadingCallback ) {

				}
			}

			var textLoaderMock = {
				load: function( url, callback ) {
					expect( url ).to.be.a( 'string' )
					expect( callback ).to.be.a( 'function' )

					if ( url.indexOf('malformed.json') != -1 ) {
						callback(
							null,
							'{ "isa" : "jsonMock }'
						)

					} else if( url.indexOf('.json') !=  -1 ) {
						callback(
							null,
							'{ "isa" : "jsonMock" }'
						)

					} else {
						callback(
							null,
							{
								isa : 'textMock'
							}
						)
					}
				}
			}


			var requestManager = new RequestManager( imageLoaderMock, soundLoaderMock, textLoaderMock )

			describe( 'spell/RequestManager', function( ) {
				[ 'jpeg', 'jpg', 'png' ].forEach(function( type ) {
					it( 'should load ' + type + ' as image', function( done ) {
						requestManager.get( 'data/defaultAppearance.' + type, function( err, data ) {

							expect( err ).to.not.exist
							expect( data ).to.exists

							expect( data ).to.be.a( 'object' )
							expect( data ).to.have.property( 'isa', 'imageMock' )

							done()
						} )
					})

					it( 'should force load ' + type + ' as image', function( done ) {
						requestManager.get( 'data/defaultAppearance.XXX', function( err, data ) {

							expect( err ).to.not.exist
							expect( data).to.exists

							expect( data ).to.be.a( 'object' )
							expect( data ).to.have.property( 'isa', 'imageMock' )

							done()
						}, type )
					})

				})

				it( 'should automatically decode json files', function( done ) {

					requestManager.get( 'data/test.json', function( err, data ) {
						expect( err ).to.not.exist
						expect( data).to.exists

						expect( data ).to.be.a( 'object' )
						expect( data ).to.have.property( 'isa', 'jsonMock' )

						done()
					} )
				})

				it( 'should handle malformed json files', function( done ) {

					requestManager.get( 'data/malformed.json', function( err, data ) {
						expect( err ).to.exist
						expect( data).to.not.exists

						done()
					} )
				})

				it( 'should treat unknown types as txt', function( done ) {

					requestManager.get( 'data/defaultAppearance.xxx', function( err, data ) {
						expect( err ).to.not.exist
						expect( data).to.exists

						expect( data ).to.be.a( 'object' )
						expect( data ).to.have.property( 'isa', 'textMock' )

						done()
					} )
				})

				it( 'should throw an exception for unknown forced type', function( done ) {
					expect(
						function() {
							requestManager.get( 'data/test.txt', function( err, data ) {}, 'XXX')
						}
					).to.throw( 'Unknown forceType' )

					done()
				})


		})
})

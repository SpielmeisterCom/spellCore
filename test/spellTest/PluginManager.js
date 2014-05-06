define(
    [
        'spell/shared/util/platform/PlatformKit',
        'spell/PluginManager'
    ],
    function(
        PlatformKit,
        PluginManager
    )
    {
        'use strict'

        var storage = PlatformKit.createPersistentStorage(),
            testKey = 'testPurchase'


        describe( 'PluginManager', function() {
                var pluginManager = new PluginManager( undefined, storage )


                describe( 'IAP', function(){
                    var iap = pluginManager.getById( 'iap' )


                    it( 'should be defined', function() {
                        iap.should.be.an( 'object' )

                        expect( iap ).to.have.property( 'iap' )
                    })

                    describe( 'Check IAP store', function() {
                        it( testKey + ' should not exist in the storage', function() {
                            storage.clear( testKey )

                            var value = storage.get( testKey )

                            expect( value ).to.be.undefined
                        })
                    })

                    describe( 'Purchase a test product', function() {
                        it( 'should fail with errorCode 2', function( done ) {
                            iap.purchase(
                                testKey,
                                function() {
                                    throw new Error( 'should not success' )
                                },
                                function( errorCode ){
                                    if( errorCode === 2 ) {
                                        done()
                                    } else {
                                        throw new Error( 'wrong errorCode' )
                                    }
                                }
                            )
                        } )

                        it( 'should success', function( done ) {
                            var stub = sinon.stub( window, "confirm" )
                            stub.returns( true )

                            iap.purchase(
                                testKey,
                                done,
                                function( errorCode ) {
                                    throw new Error( 'iap.purchase threw an error with code: ' + errorCode )
                                }
                            )
                        } )

                        it( 'should have an purchase with key ' + testKey, function() {
                            var product = iap.hasProduct( testKey )

                            expect( product ).to.exist
                            expect( product ).to.be.true
                        } )
                    } )

                    describe( 'Consume ' + testKey, function(){
                        it( 'should not exist anymore', function( done ) {
                            iap.consume( testKey,
                                function() {
                                    var product = iap.hasProduct( testKey )

                                    expect( product ).to.be.false
                                    done()
                                },
                                function() {
                                    throw new Error( 'Should success' )
                                }
                            )

                        } )

                        it( 'consumption of ' + testKey + ' again should throw an error', function( done ) {
                            iap.consume( testKey,
                                function() {
                                    throw new Error( 'Should not success' )
                                },
                                done
                            )
                        } )
                    } )
                } )
            }
        )
    }
)
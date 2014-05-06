define(
    [
        'spell/shared/util/platform/PlatformKit',
        'spell/PluginManager',

        'spell/Defines'
    ],
    function(
        PlatformKit,
        PluginManager,

        Defines
    )
    {
        'use strict'

        var storage = PlatformKit.createPersistentStorage(),
            testKey = 'testPurchase'


        describe( 'spell/PluginManager', function() {
		        return
                var pluginManager = new PluginManager( undefined, storage )


                describe( 'IAP', function(){
                    var iap   = pluginManager.getById( 'iap'),
                        STATE = Defines.IAP.STATE


                    it( 'should be defined', function() {
                        iap.should.be.an( 'object' )

                        expect( iap ).to.have.property( 'iap' )
                    })

                    describe( 'Check IAP store', function() {
                        it( testKey + ' should not exist in the storage', function() {
                            var secretStoreKey = 'iap.' + testKey

                            storage.clear( secretStoreKey )

                            var value = storage.get( secretStoreKey )

                            expect( value ).to.be.undefined
                        })
                    })

                    describe( 'Purchase a test product', function() {
                        it( 'should fail with errorCode STATE.notFulfilled', function( done ) {
                            iap.purchase(
                                testKey,
                                function() {
                                    throw new Error( 'should not success' )
                                },
                                function( errorCode ){
                                    expect( errorCode ).to.equal( STATE.notFulfilled )
                                    done()
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

                        it( 'purchase again should fail with errorCode STATE.alreadyPurchased', function( done ) {
                            iap.purchase(
                                testKey,
                                function() {
                                    throw new Error( 'should fail' )
                                },
                                function( errorCode ) {
                                    expect( errorCode).to.equal( STATE.alreadyPurchased )
                                    done()
                                }
                            )
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

                    describe( 'Another purchase of ' + testKey, function() {
                        it( 'should be possible', function( done ) {
                            iap.purchase(
                                testKey,
                                done,
                                function( errorCode ) {
                                    throw new Error( 'iap.purchase threw an error with code: ' + errorCode )
                                }
                            )
                        } )
                    } )
                } )
            }
        )
    }
)
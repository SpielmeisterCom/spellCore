define(
    [
        'spell/PluginManager',
        'underscore'
    ],
    function(
        PluginManager,
        _
    )
    {
        'use strict'

        describe('just checking', function() {
            it('works for underscore', function() {
                // just checking that _ works
                expect( _.size( [1,2,3] ) ).to.equal( 3 )
            })

        })

        describe( 'PluginManager', function() {
                var pluginManager = new PluginManager()

                it( 'Is iap defined', function() {
                    var plugins = pluginManager.getById( 'iap' )

                    plugins.should.be.an( 'object' )

                    expect( plugins).to.have.property( 'iap' )
                })

				describe( 'Check IAP store', function() {
					it( 'store should be empty', function() {

					})
				})
            }
        )
    }
)
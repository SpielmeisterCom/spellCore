define(
	[
		'spell/asset/constructAssets'
	],
	function(
		constructAssets
	) {
		'use strict'

			describe( 'spell/asset/constructAsset', function( ) {

				it.only( 'should fail on non asset types', function() {
					expect(
						function() {
							var result =
								constructAssets({
									'test.library.id': {
										type: 'entityTemplate'
									}
								})
						}
					).to.throw( 'Error' )
				})

				it( 'should fail on unknown asset subtype', function() {
					expect(
						function() {
							var result = constructAssets({
								'test.library.id': {
									type:       'asset',
									subtype:    'unknown'
								}
							})
						}
					).to.throw( 'Error' )
				})


				it( 'should correctly construct an appearance asset', function( done ) {
					var asset = constructAssets({
						'test.library.id': {
							"version": 1,
							"type": "asset",
							"subtype": "appearance",
							"config": {
							"localized": false,
								"localization": "",
								"extension": "png"
							},
							"dependencies": []
						}
					})

					console.log( asset )

					done()
				})
			})
})

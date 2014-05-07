define(
	[
		'spell/library/getAssetIdReferencesForEntities'
	],
	function(
		getAssetIdReferencesForEntities
	) {
		'use strict'

			var testLibrary = {
				"test.Component": {
					"type": "component",
					"attributes": [
						{
							"name": "assetId",
							"type": "assetId:spriteSheet",
							"default": "appearance:spell.defaultAppearance",
							"doc": "the spritesheet asset used for rendering"
						}
					]
				}
			}

	describe('spell/library/getAssetIdReferencesForEntities', function() {

			it( 'should correctly resolve referenced assetIds', function( done ) {

				var referencedAssetIds = getAssetIdReferencesForEntities(
					testLibrary,
					[{
						'name': 'test',
						config: {
							'test.OtherComponent': {
								'assetId': 'apperance:XX'
							},

							'test.Component': {
								'assetId': 'apperance:testAssetId'
							}
						},

						children: [{
							'name': 'child',
							'config': {
								'test.Component': {
									'assetId': 'apperance:testAssetId2'
								}
							}
						}]
					}]
				)

				expect( referencedAssetIds ).to.have.length( 2 )
				expect( referencedAssetIds[ 0 ] ).to.be.equal( 'testAssetId' )
				expect( referencedAssetIds[ 1 ] ).to.be.equal( 'testAssetId2' )


				done()
			} )

		})
	})
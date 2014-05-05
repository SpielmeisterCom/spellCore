define(
	[
		'spell/data/spatial/BoxTree'
	],
	function(
		BoxTree
	) {
		'use strict'

			var boxtree = BoxTree.create( true )

			describe( 'BoxTree', function( ) {
				it( 'should correctly return an added object', function( done ) {

					var result = []
					boxtree.add( {objectId:1}, [0, 0, 10, 10])
					boxtree.add( {objectId:2}, [11, 11, 20, 20])

					boxtree.finalize()


					boxtree.getOverlappingNodes(
						[0, 0, 10, 10],
						result
					)

					expect( result ).to.have.length( 1 )
					expect( result[0] ).to.have.property( 'objectId', 1 )

					done()
				})
			})
})

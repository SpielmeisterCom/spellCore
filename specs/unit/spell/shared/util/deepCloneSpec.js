define(
	[
		"spell/shared/util/deepClone"
	],
	function(
		deepClone
	) {
		"use strict"
		
		
		describe( "deepClone", function() {
			it( "should deeply clone an object.", function() {
				var original = { a: 1, b: { x: 10 } }
				
				var clone = deepClone( original )
				clone.b.x += 1

				expect( original ).toEqual( { a: 1, b: { x: 10 } } )
				expect( clone    ).toEqual( { a: 1, b: { x: 11 } } )
			} )
		} )
	}
)

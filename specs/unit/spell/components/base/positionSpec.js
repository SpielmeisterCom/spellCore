define(
	[
		"spell/components/base/position",
		"spell/util/common/Vector"
	],
	function(
		position,
		Vector
	) {
		"use strict";
		
		
		describe( "position", function() {
			it( "should create a position component with default values.", function() {
				var defaultPositionComponent = position( {} )
				expect( defaultPositionComponent ).toEqual( Vector.create( 0, 0 ) )
			} )
			
			it( "should create a position component with the given values.", function() {
				var positionComponent = position( { x: 1, y: 2 } )
				expect( positionComponent ).toEqual( Vector.create( 1, 2 ) )
			} )
			
			it( "should create a position component from a vector.", function() {
				var positionComponent = position( Vector.create( 1, 2 ) )
				expect( positionComponent ).toEqual( Vector.create( 1, 2 ) )
			} )
		} )
	}
)

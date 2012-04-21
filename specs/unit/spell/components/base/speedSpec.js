
define(
	[
		"spell/components/base/speed",
		"spell/util/common/Vector"
	],
	function(
		speed,
		Vector
	) {
		"use strict";
		
		
		describe( "speed", function() {
			it( "should create a speed component with default values.", function() {
				var defaultSpeedComponent = speed( {} )
				expect( defaultSpeedComponent ).toEqual( Vector.create( 0, 0 ) )
			} )
			
			it( "should create a speed component with the given values.", function() {
				var speedComponent = speed( { x: 1, y: 2 } )
				expect( speedComponent ).toEqual( Vector.create( 1, 2 ) )
			} )
			
			it( "should create a speed component from a vector.", function() {
				var speedComponent = speed( Vector.create( 1, 2 ) )
				expect( speedComponent ).toEqual( Vector.create( 1, 2 ) )
			} )
		} )
	}
)

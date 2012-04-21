
define(
	[
		"spell/components/base/orientation"
	],
	function(
		orientation
	) {
		"use strict";
		
		
		describe( "orientation", function() {
			it( "should create a orientation component with default values.", function() {
				var defaultOrientationComponent = orientation( {} )
				expect( defaultOrientationComponent ).toEqual( 0 )
			} )
			
			it( "should create a speed component with the given values.", function() {
				var orientationComponent = orientation( { angle: 1.5 } )
				expect( orientationComponent ).toEqual( 1.5 )
			} )
		} )
	}
)

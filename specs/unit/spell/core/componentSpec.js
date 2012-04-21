
define(
	[
		"spell/core/component"
	],
	function(
		component
	) {
		"use strict";
		
		
		describe( "component", function() {
			it( "should return an object with the component's id and parameters.", function() {
				var id         = "myComponent"
				var parameters = { value: 5 }
				
				var componentObject = component( id, parameters )
				
				expect( componentObject ).toEqual( {
					id:         id,
					parameters: parameters
				} )				
			} )
		} )
	}
)

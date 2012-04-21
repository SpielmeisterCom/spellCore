
define(
	[
		"spell/components/base/debug"
	],
	function(
		debug,
		component
	) {
		"use strict";
		
		
		describe( "debug", function() {
			it( "should create a debug component.", function() {
				var debugComponent = debug( {} )
				expect( debugComponent ).toEqual( {} )
			} )
		} )
	}
)

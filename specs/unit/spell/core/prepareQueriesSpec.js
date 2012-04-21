define(
	[
		"spell/core/MainLoop",
		"spell/core/Manifest",
		"spell/core/prepareQueries"
	],
	function(
		MainLoop,
		Manifest,
		prepareQueries
	) {
		"use strict";
		
		
		describe( "prepareQueries", function() {
			it( "should prepare all specified entity queries.", function() {
				var queryId = 4
				var entities = {
					prepareQuery: function() {}
				}
				spyOn( entities, "prepareQuery" ).andReturn( queryId )
				
				function MyDataStructure() {}
				var parameter = "p"
				
				var manifest = Manifest.create()
					.pushArgument( "entities" ).withComponents( "a", "b" )
					.pushArgument( "entities" ).withComponents( "c", "d" ).inDataStructure( MyDataStructure, [ parameter ] )
				
				prepareQueries( entities, manifest )
				
				runs( function() {
					expect( manifest.arguments[ 0 ].queryId ).toEqual( queryId )
					expect( manifest.arguments[ 1 ].queryId ).toEqual( queryId )
					expect( entities.prepareQuery ).toHaveBeenCalledWith( [ "a", "b" ] )
					expect( entities.prepareQuery ).toHaveBeenCalledWith( [ "c", "d" ], MyDataStructure, [ parameter ] )
				} )
			} )
		} )
	}
)

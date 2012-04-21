define(
	[
		"spell/shared/util/forestMultiMap"
	],
	function(
		forestMultiMap
	) {
		"use strict"
		
		
		describe( "forestMultiMap", function() {
		
			var data
			
			beforeEach( function() {
				data = forestMultiMap.create()
			} )
			it( "should return elements that were added under the same key.", function() {
				forestMultiMap.add( data, [ "key", "subKeyA" ], "an object"          )
				forestMultiMap.add( data, [ "key", "subKeyA" ], "another object"     )
				forestMultiMap.add( data, [ "key", "subKeyB" ], "yet another object" )
				
				var elements = forestMultiMap.get( data, [ "key", "subKeyA" ] )
				
				expect( elements ).toEqual( [ "an object", "another object" ] )
			} )
			
			it( "should return elements that were added under a sub-key.", function() {
				forestMultiMap.add( data, [ "keyA", "subKeyA" ], "an object"          )
				forestMultiMap.add( data, [ "keyA", "subKeyB" ], "another object"     )
				forestMultiMap.add( data, [ "keyB", "subKey"  ], "yet another object" )
				
				var elements = forestMultiMap.get( data, [ "keyA" ] )
				
				expect( elements ).toEqual( [ "an object", "another object" ] )
			} )
			
			it( "should not return elements that have been removed.", function() {
				forestMultiMap.add( data, [ "key" ], "an object"      )
				forestMultiMap.add( data, [ "key" ], "another object" )
				forestMultiMap.remove( data, [ "key" ], "another object" )
				
				var elements = forestMultiMap.get( data, [ "key" ] )
				
				expect( elements ).toEqual( [ "an object" ] )				 
			} )
			
			it( "should return an empty list, if no elements were ever added to the key.", function() {
				var elements = forestMultiMap.get( data, [ "key" ] )
				
				expect( elements ).toEqual( [] )
			} )
		} )
	}
)

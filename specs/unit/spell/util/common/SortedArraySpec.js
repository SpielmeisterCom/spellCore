
define(
	[
		"spell/util/common/SortedArray"
	],
	function(
		SortedArray
	) {
		"use strict";
		
		
		
		describe( "SortedArray", function() {
			
			var sortedArray
			
			beforeEach( function() {
				sortedArray = SortedArray.create()
			} )
			
			it( "should always be sorted, after an element has been pushed.", function() {
				sortedArray.push( 3 )
				sortedArray.push( 1 )
				sortedArray.push( 2 )
				
				expect( sortedArray[ 0 ] ).toEqual( 1 )
				expect( sortedArray[ 1 ] ).toEqual( 2 )
				expect( sortedArray[ 2 ] ).toEqual( 3 )
			} )
			
			it( "should allow for setting a compareFunction.", function() {
				sortedArray.compareFunction = function( a, b ) { return b - a }
				
				sortedArray.push( 2 )
				sortedArray.push( 1 )
				sortedArray.push( 3 )
				
				expect( sortedArray[ 0 ] ).toEqual( 3 )
				expect( sortedArray[ 1 ] ).toEqual( 2 )
				expect( sortedArray[ 2 ] ).toEqual( 1 )
			} )
			
			it( "should preserve the compare function if a new sorted array is created from an existing one.", function() {
				var compareFunction = function( a, b ) { return 0 }
				sortedArray.compareFunction = compareFunction
				
				var concatenatedSortedArray = sortedArray.concat( [] )
				var filteredSortedArray     = sortedArray.filter( function() { return true } )
				var mappedSortedArray       = sortedArray.map( function( element ) { return element } )
				
				expect( concatenatedSortedArray.compareFunction ).toEqual( compareFunction )
				expect( filteredSortedArray.compareFunction ).toEqual( compareFunction )
				expect( mappedSortedArray.compareFunction ).toEqual( compareFunction )
			} )
		} )
	}
)

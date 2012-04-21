define(
	[
		"spell/shared/util/entities/datastructures/sortedArray"
	],
	function(
		sortedArray
	) {
		"use strict"
		
		
		describe( "sortedArray", function() {
			
			var sortedNumberArray = sortedArray( function( a, b ) {
				return a - b
			} )
			
			it( "should initialize the array on creation.", function() {
				var map = {}
				
				sortedNumberArray.onCreate( map )
				
				expect( map ).toEqual( { sortedArray: [] } )
			} )
			
			it( "should add elements to the array at the correct position.", function() {
				var map = { sortedArray: [] }
				
				sortedNumberArray.onAdd( map, "2", 2 )
				sortedNumberArray.onAdd( map, "1", 1 )
				sortedNumberArray.onAdd( map, "3", 3 )
				
				expect( map ).toEqual( { sortedArray: [ 1, 2, 3 ] } )
			} )
			
			it( "should replace an element that has already been added.", function() {
				var map = { sortedArray: [] }
				
				sortedNumberArray.onAdd( map, "1", 1 )
				sortedNumberArray.onUpdate( map, "1", 1, 2 )
				
				expect( map ).toEqual( { sortedArray: [ 2 ] } )
			} )
			
			it( "should remove the element from the array.", function() {
				var map = { sortedArray: [ 1, 2, 2, 3 ] }
				
				sortedNumberArray.onRemove( map, "2", 2 )
				
				expect( map ).toEqual( { sortedArray: [ 1, 2, 3 ] } )
			} )
		} )
	}
)

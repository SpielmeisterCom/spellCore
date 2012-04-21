
define(
	[
		"spell/util/common/dialect",
		"spell/util/common/ArrayLike"
	],
	function(
		dialect,
		ArrayLike
	) {
		"use strict";
		
		
		
		describe( "ArrayLike", function() {
		
			var elementA = { a: "a" }
			var elementB = { b: "b" }
			
			var arrayLike
			
			beforeEach( function() {
				arrayLike = ArrayLike.create()
			} )
			
			it( "should make added elements available via indices.", function() {
				arrayLike.push( elementA )
				arrayLike.push( elementB )
				
				expect( arrayLike[ 0 ] ).toEqual( elementA )
				expect( arrayLike[ 1 ] ).toEqual( elementB )
			} )
			
			it( "should update its length attribute when adding elements.", function() {
				expect( arrayLike.length ).toEqual( 0 )
				
				arrayLike.push( elementA )
				expect( arrayLike.length ).toEqual( 1 )
				
				arrayLike.push( elementB )
				expect( arrayLike.length ).toEqual( 2 )
			} )
			
			it( "should pop elements from an array.", function() {
				arrayLike.push( elementA )
				arrayLike.push( elementB )
				
				var poppedElement = arrayLike.pop()
				
				expect( arrayLike.length ).toEqual( 1 )
				expect( arrayLike[ 0 ] ).toEqual( elementA )
				expect( poppedElement ).toEqual( elementB )
			} )

			describe( "concat", function() {
				it( "should concatenate an array-like object.", function() {
					arrayLike.push( elementA )
					var array = [ elementB ]
					
					var concatenatedArrayLike = arrayLike.concat( array )

					expect( concatenatedArrayLike[ 0 ] ).toEqual( elementA )
					expect( concatenatedArrayLike[ 1 ] ).toEqual( elementB )
				} )
				
				it( "should not modify itself nor the concatenated array-like object.", function() {
					arrayLike.push( elementA )
					var array = [ elementB ]
					
					arrayLike.concat( array )
					
					expect( arrayLike.length ).toEqual( 1 )
					expect( array.length ).toEqual( 1 )
				} )
			} )
			
			it( "should provide forEach.", function() {
				arrayLike.push( elementA )
				arrayLike.push( elementB )
				var elements   = []
				var indices    = []
				var arrayLikes = []
				
				arrayLike.forEach( function( element, index, arrayLike ) {
					elements.push( element )
					indices.push( index )
					arrayLikes.push( arrayLike )
				} )
				
				expect( elements ).toEqual( [ elementA, elementB ] )
				expect( indices ).toEqual( [ 0, 1 ] )
				expect( arrayLikes ).toEqual( [ arrayLike, arrayLike ] )
			} )
			
			it( "should provide every.", function() {
				arrayLike.push( elementA )
				arrayLike.push( elementB )
				var elements   = []
				var indices    = []
				var arrayLikes = []
				
				var containsOnlyelementA = arrayLike.every( function( element, index, arrayLike ) {
					elements.push( element )
					indices.push( index )
					arrayLikes.push( arrayLike )
					
					return element === elementA
				} )
				var shouldBeTrue = arrayLike.every( function() {
					return true
				} )
				
				expect( elements ).toEqual( [ elementA, elementB ] )
				expect( indices ).toEqual( [ 0, 1 ] )
				expect( arrayLikes ).toEqual( [ arrayLike, arrayLike ] )
				expect( containsOnlyelementA ).toEqual( false )
				expect( shouldBeTrue ).toEqual( true )
			} )
			
			it( "should provide some.", function() {
				arrayLike.push( elementA )
				arrayLike.push( elementB )
				var elements   = []
				var indices    = []
				var arrayLikes = []
				
				var containselementA = arrayLike.some( function( element, index, arrayLike ) {
					elements.push( element )
					indices.push( index )
					arrayLikes.push( arrayLike )
					
					return element === elementB
				} )
				var shouldBeFalse = arrayLike.some( function() {
					return false
				} )
				
				expect( elements ).toEqual( [ elementA, elementB ] )
				expect( indices ).toEqual( [ 0, 1 ] )
				expect( arrayLikes ).toEqual( [ arrayLike, arrayLike ] )
				expect( containselementA ).toEqual( true )
				expect( shouldBeFalse ).toEqual( false )
			} )
				
			it( "should provide filter.", function() {
				arrayLike.push( elementA )
				arrayLike.push( elementB )
				var elements   = []
				var indices    = []
				var arrayLikes = []
				
				var filteredArrayLike = arrayLike.filter( function( element, index, arrayLike ) {
					elements.push( element )
					indices.push( index )
					arrayLikes.push( arrayLike )
					return element === elementA
				} )
				
				expect( elements ).toEqual( [ elementA, elementB ] )
				expect( indices ).toEqual( [ 0, 1 ] )
				expect( arrayLikes ).toEqual( [ arrayLike, arrayLike ] )
				expect( filteredArrayLike.length ).toEqual( 1 )
				expect( filteredArrayLike[ 0 ] ).toEqual( elementA )
				expect( filteredArrayLike.cellSize ).toEqual( arrayLike.cellSize )
			} )
			
			it( "should provide map.", function() {
				arrayLike.push( elementA )
				arrayLike.push( elementB )
				var elements   = []
				var indices    = []
				var arrayLikes = []
				
				var mappedArrayLike = arrayLike.map( function( element, index, arrayLike ) {
					elements.push( element )
					indices.push( index )
					arrayLikes.push( arrayLike )
					return element
				} )
				
				expect( elements ).toEqual( [ elementA, elementB ] )
				expect( indices ).toEqual( [ 0, 1 ] )
				expect( arrayLikes ).toEqual( [ arrayLike, arrayLike ] )
				expect( mappedArrayLike.length ).toEqual( 2 )
				expect( mappedArrayLike[ 0 ] ).toEqual( elementA )
				expect( mappedArrayLike[ 1 ] ).toEqual( elementB )
				expect( mappedArrayLike.cellSize ).toEqual( arrayLike.cellSize )
			} )
			
			describe( "reduce", function() {
				
				var elementC = { c: "c" }
				
				it( "should work with initial value.", function() {
					arrayLike.push( elementB )
					arrayLike.push( elementC )
					var previousElements = []
					var currentElements  = []
					var indices          = []
					var arrayLikes       = []
					
					var lastElement = arrayLike.reduce( function( previouselement, currentElement, index, arrayLike ) {
						previousElements.push( previouselement )
						currentElements.push( currentElement )
						indices.push( index )
						arrayLikes.push( arrayLike )
						
						return currentElement
					}, elementA )
					
					expect( previousElements ).toEqual( [ elementA, elementB ] )
					expect( currentElements ).toEqual( [ elementB, elementC ] )
					expect( indices ).toEqual( [ 0, 1 ] )
					expect( arrayLikes ).toEqual( [ arrayLike, arrayLike ] )
					expect( lastElement ).toEqual( elementC )
				} )
				
				it( "should work without an initial value.", function() {
					arrayLike.push( elementA )
					arrayLike.push( elementB )
					arrayLike.push( elementC )
					var previousElements = []
					var currentElements  = []
					var indices          = []
					var arrayLikes       = []
					
					var lastElement = arrayLike.reduce( function( previouselement, currentElement, index, arrayLike ) {
						previousElements.push( previouselement )
						currentElements.push( currentElement )
						indices.push( index )
						arrayLikes.push( arrayLike )
						
						return currentElement
					} )
					
					expect( previousElements ).toEqual( [ elementA, elementB ] )
					expect( currentElements ).toEqual( [ elementB, elementC ] )
					expect( indices ).toEqual( [ 1, 2 ] )
					expect( arrayLikes ).toEqual( [ arrayLike, arrayLike ] )
					expect( lastElement ).toEqual( elementC )
				} )
			} )
			
			describe( "reduceRight", function() {
			
				var elementC = { c: "c" }
				
				it( "should work with initial value.", function() {
					arrayLike.push( elementA )
					arrayLike.push( elementB )
					var previousElements = []
					var currentElements  = []
					var indices          = []
					var arrayLikes       = []
					
					var firstElement = arrayLike.reduceRight( function( previouselement, currentElement, index, arrayLike ) {
						previousElements.push( previouselement )
						currentElements.push( currentElement )
						indices.push( index )
						arrayLikes.push( arrayLike )
						
						return currentElement
					}, elementC )
					
					expect( previousElements ).toEqual( [ elementC, elementB ] )
					expect( currentElements ).toEqual( [ elementB, elementA ] )
					expect( indices ).toEqual( [ 1, 0 ] )
					expect( arrayLikes ).toEqual( [ arrayLike, arrayLike ] )
					expect( firstElement ).toEqual( elementA )
				} )
				
				it( "should work without an initial value.", function() {
					arrayLike.push( elementA )
					arrayLike.push( elementB )
					arrayLike.push( elementC )
					var previousElements = []
					var currentElements  = []
					var indices          = []
					var arrayLikes       = []
					
					var firstElement = arrayLike.reduceRight( function( previouselement, currentElement, index, arrayLike ) {
						previousElements.push( previouselement )
						currentElements.push( currentElement )
						indices.push( index )
						arrayLikes.push( arrayLike )
						
						return currentElement
					} )
					
					expect( previousElements ).toEqual( [ elementC, elementB ] )
					expect( currentElements ).toEqual( [ elementB, elementA ] )
					expect( indices ).toEqual( [ 1, 0 ] )
					expect( arrayLikes ).toEqual( [ arrayLike, arrayLike ] )
					expect( firstElement ).toEqual( elementA )
				} )
			} )
			
			it( "should use a factory function when creating a new data structure.", function() {
				var otherArrayLike = ArrayLike.create()
				otherArrayLike.isOtherArrayLike = true
				arrayLike.createArrayLike = function() { return otherArrayLike }
				
				var concatenatedArrayLike = arrayLike.concat( [] )
				var filteredArrayLike     = arrayLike.filter( function() { return true } )
				var mappedArrayLike       = arrayLike.map( function( element ) { return element } )
				
				expect( concatenatedArrayLike.isOtherArrayLike ).toEqual( true )
				expect( filteredArrayLike.isOtherArrayLike ).toEqual( true )
				expect( mappedArrayLike.isOtherArrayLike ).toEqual( true )
			} )
		} )
	}
)

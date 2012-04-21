define(
	[
		"spell/util/common/dialect",
		"spell/util/common/Map"
	],
	function(
		dialect,
		Map
	) {
		"use strict";
		
		
		describe( "Map", function() {
		
			var map
			var keyA
			var valueA
			var keyB
			var valueB
			
			beforeEach( function() {
				map    = Map.create()
				keyA   = "x"
				valueA = { x: "x" }
				keyB   = "y"
				valueB = { y: "y" }
			} )
			
			describe( "constructor", function() {
				it( "should add all passed elements to the new map.", function() {
					map = Map.create(
						[ keyA, valueA ],
						[ keyB, valueB ]
					)
					
					expect( map.get( keyA ) ).toEqual( valueA )
					expect( map.get( keyB ) ).toEqual( valueB )
					expect( map.size() ).toEqual( 2 )
				} )
			} )
			
			describe( "add/get", function() {
				it( "should return a value that has been added.", function() {
					map.add( keyA, valueA )
					var valueFromMap = map.get( keyA )
					
					expect( valueFromMap ).toEqual( valueA )
				} )
				
				it( "should overwrite the value if a key already exists.", function() {
					map.add( keyA, valueA )
					map.add( keyA, valueB )
					
					expect( map.get( keyA ) ).toEqual( valueB )
					expect( map.size() ).toEqual( 1 )
				} )
			} )
			
			describe( "remove", function() {
				it( "should throw an exception, if a passed key does not exist.", function() {
					var caughtAnException = false
					try {
						map.remove( keyA )
					}
					catch ( e ) {
						caughtAnException = true
					}
					
					expect( caughtAnException ).toEqual( true )
				} )
				
				it( "should return the value that was removed.", function() {
					map.add( keyA, valueA )
					
					var removedValue = map.remove( keyA )
					
					expect( removedValue ).toEqual( valueA )
				} )
			} )
			
			describe( "contains", function() {
				it( "should contain a value that has been added.", function() {
					map.add( keyA, valueA )
					
					expect( map.contains( keyA ) ).toEqual( true )
				} )
				
				it( "should not contain a value that was never added.", function() {
					expect( map.contains( keyA ) ).toEqual( false )
				} )
				
				it( "should not contain a value that has been removed.", function() {
					map.add( keyA, valueA )
					map.remove( keyA )
					
					expect( map.contains( keyA ) ).toEqual( false )
				} )
			} )
			
			describe( "empty", function() {
				it( "should return an empty Map.", function() {
					var emptyMap = map.empty()
					
					expect( emptyMap ).toEqual( map )
				} )
			} )
			
			describe( "size", function() {
				it( "should return the number of elements in the map.", function() {
					expect( map.size() ).toEqual( 0 )
					
					map.add( keyA, valueA )
					expect( map.size() ).toEqual( 1 )
					
					map.add( "y", { y: "y" } )
					expect( map.size() ).toEqual( 2 )
					
					map.remove( keyA )
					expect( map.size() ).toEqual( 1 )
				} )
			} )
			
			describe( "forEach", function() {
				it( "should iterate over all elements.", function() {
					map.add( keyA, valueA )
					map.add( keyB, valueB )
					var sawA = false
					var sawB = false
					
					map.forEach( function( key, value ) {
						if ( key === keyA && value === valueA ) {
							sawA = true
						}
						if ( key === keyB && value === valueB ) {
							sawB = true
						}
					} )
					
					expect( sawA ).toEqual( true )
					expect( sawB ).toEqual( true )
				} )
			} )
			
			describe( "map", function() {
				it( "should return a mapped Map.", function() {
					map.add( keyA, 1 )
					map.add( keyB, 2 )
					
					var mappedMap = map.map( function( key, value ) {
						return value * 2
					} )
					
					expect( mappedMap.get( keyA ) ).toEqual( 2 )
					expect( mappedMap.get( keyB ) ).toEqual( 4 )
				} )
				
				it( "should use the empty method to create the new map.", function() {
					var ExtendedMap = Map.extend( function() {
						this.isExtendedMap = true
						this.empty = function() {
							return ExtendedMap.create()
						}
					} )
					var extendedMap = ExtendedMap.create()
					
					var mappedMap = extendedMap.map( function( key, value ) { return value } )
					
					expect( mappedMap.isExtendedMap ).toEqual( true )
				} )
			} )
			
			describe( "filter", function() {
				it( "should return a filtered Map.", function() {
					map.add( keyA, valueA )
					map.add( "y", { y: "y" } )
					
					var filteredMap = map.filter( function( key, value ) {
						return keyA === key
					} )
					
					expect( filteredMap.size() ).toEqual( 1 )
					expect( filteredMap.get( keyA ) ).toEqual( valueA )
				} )
				
				it( "should use the empty method to create the new map.", function() {
					var ExtendedMap = Map.extend( function() {
						this.isExtendedMap = true
						this.empty = function() {
							return ExtendedMap.create()
						}
					} )
					var extendedMap = ExtendedMap.create()
					
					var filteredMap = extendedMap.filter( function() { return true } )
					
					expect( filteredMap.isExtendedMap ).toEqual( true )
				} )
			} )
			
			describe( "every", function() {
				it( "should return whether a condition is met for every element.", function() {
					map.add( keyA, valueA )
					map.add( keyB, valueB )
					
					var shouldBeTrue = map.every( function( key, value ) {
						return true
					} )
					var shouldBeFalse = map.every( function( key, value ) {
						return key === keyA
					} )
					
					expect( shouldBeTrue  ).toEqual( true  )
					expect( shouldBeFalse ).toEqual( false )
				} )
			} )
			
			describe( "some", function() {
				it( "should return whether a condition is met for some elements.", function() {
					map.add( keyA, valueA )
					map.add( keyB, valueB )
					
					var shouldBeFalse = map.some( function( key, value ) {
						return false
					} )
					var shouldBeTrue = map.some( function( key, value ) {
						return key === keyA
					} )
					
					expect( shouldBeFalse ).toEqual( false )
					expect( shouldBeTrue  ).toEqual( true  )
				} )
			} )
		} )
	}
)

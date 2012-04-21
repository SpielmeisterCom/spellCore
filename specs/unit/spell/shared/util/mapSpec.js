define(
	[
		"spell/shared/util/map"
	],
	function(
		map
	) {
		"use strict"
		
		
		describe( "map", function() {
		
			var key   = 3
			var value = { x: "y" }
			
			var m
			
			beforeEach( function() {
				m = map.create()
			} )
			
			it( "should create am empty map.", function() {
				expect( m ).toEqual( { elements: {} } )
			} )
			
			it( "should create a map with the given initial elements.", function() {
				var key2   = 5
				var value2 = { a: "b" }
				
				m = map.create( [
					[ key , value  ],
					[ key2, value2 ]
				] )
				
				expect( m.elements[ key  ] ).toEqual( value  )
				expect( m.elements[ key2 ] ).toEqual( value2 )
			} )
			
			it( "should add an element to a map.", function() {
				map.add( m, key, value )
				
				expect( m.elements[ key ] ).toEqual( value )
			} )
			
			it( "should remove an element from a map.", function() {
				map.add( m, key, value )
				
				map.remove( m, key )
				
				expect( m.elements.hasOwnProperty( key ) ).toEqual( false )
			} )
			
			describe( "listeners", function() {
				
				var listener
				
				beforeEach( function() {
					listener = {
						onCreate: function() {},
						onAdd   : function() {},
						onRemove: function() {},
						onUpdate: function() {}
					}
				} )
				
				it( "should notify the listener when create a map.", function() {
					spyOn( listener, "onCreate" )
					
					var m = map.create( [], listener )
					
					expect( listener.onCreate ).toHaveBeenCalledWith( m )
				} )
				
				it( "should notify the listener when adding an element.", function() {
					spyOn( listener, "onAdd" )
					
					map.add( m, key, value, listener )
					
					expect( listener.onAdd ).toHaveBeenCalledWith( m, key, value )
				} )
				
				it( "should notify the listener when removing an element.", function() {
					spyOn( listener, "onRemove" )
					
					map.add( m, key, value )
					map.remove( m, key, listener )
					
					expect( listener.onRemove ).toHaveBeenCalledWith( m, key, value )
				} )
				
				it( "should notify the listener when updating an element.", function() {
					var value2 = { a: "b" }
					
					spyOn( listener, "onAdd" )
					spyOn( listener, "onUpdate" )
					
					map.add( m, key, value )
					map.add( m, key, value2, listener )
					
					expect( listener.onAdd ).not.toHaveBeenCalled()
					expect( listener.onUpdate ).toHaveBeenCalledWith( m, key, value, value2 )
				} )
				
				it( "should not notify the listener if remove was called but no element was actually removed.", function() {
					spyOn( listener, "onRemove" )
					
					map.add( m, key, value )
					map.remove( m, key + 1, listener )
					
					expect( listener.onRemove ).not.toHaveBeenCalled()
				} )
			} )
		} )
	}
)

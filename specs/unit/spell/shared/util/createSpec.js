define(
	[
		"spell/shared/util/create"
	],
	function(
		create
	) {
		"use strict"
		
		
		describe( "create", function() {
			it( "should act like new.", function() {
				var a = "a"
				var b = "b"
				function MyConstructor( a ) {
					this.a = a
				}
				MyConstructor.prototype.b = b
				
				var o = create( MyConstructor, [ a ] )
				
				expect( o.a ).toEqual( a )
				expect( o.b ).toEqual( b )
			} )
			
			it( "should return the object that the constructor returns, if it returns one.", function() {
				var anObject = { x: "x" }
				function MyConstructor() {
					return anObject
				}
				
				var o = create( MyConstructor )
				
				expect( o ).toEqual( anObject )
			} )
			
			it( "should throw an error, if the argument is not a constructor.", function() {
				var anObject = { an: "object" }
				
				var exception
				try {
					create( anObject )
				}
				catch ( e ) {
					exception = e
				}
				
				expect( exception ).toContain( create.NO_CONSTRUCTOR_ERROR )
				expect( exception ).toContain( anObject.toString() )
			} )
		} )
	}
)

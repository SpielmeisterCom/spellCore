
define(
	[
		"spell/util/common/dialect"
	],
	function(
		dialect
	) {
	
		describe( "dialect", function() {
			describe( "Object.prototype.cloneOwnProperties", function() {
				it( "should clone an object's own properties, but not those from a prototype.", function() {
					function Constructor() {
						this.a = "a",
						this.b = "b"
					}
					Constructor.prototype.c = "c"
					var originalObject = Constructor.create()
					
					var clonedObject = originalObject.cloneOwnProperties()
					clonedObject.a = "x"
					
					expect( clonedObject ).toEqual( {
						a: "x",
						b: "b"
					} )
					
					expect( originalObject.a ).toEqual( "a" )
				} )
			} )
			
			describe( "Object.prototype.cloneAllProperties", function() {
				it( "should clone all of an object's enumerable properties, including those from the prototype.", function() {
					function Constructor() {
						this.a = "a",
						this.b = "b"
					}
					Constructor.prototype.c = "c"
					var originalObject = Constructor.create()
					
					var clonedObject = originalObject.cloneAllProperties()
					clonedObject.a = "x"
					
					expect( clonedObject ).toEqual( {
						a: "x",
						b: "b",
						c: "c"
					} )
					
					expect( originalObject.a ).toEqual( "a" )
				} )
			} )
			
			describe( "Object.prototype.forEachOwnProperty", function() {
				it( "should iterate over all own properties.", function() {
					function Original() {
						this.a = "a"
						this.b = "b"
					}
					Original.prototype.c = "c"
					var original = Original.create()
					var clone = {}
					
					original.forEachOwnProperty( function( key, property ) {
						clone[ key ] = property
					} )
					
					expect( clone ).toEqual( {
						a: "a",
						b: "b"
					} )
				} )
				
				it( "should return everything that's returned by the anonymous function.", function() {
					var o = { a: "x", b: "y" }
					
					var properties = o.forEachOwnProperty( function( key, property ) { return property } )
					
					expect( properties ).toEqual( [ "x", "y" ] )
				} )
			} )
			
			describe( "Object.prototype.forEachProperty", function() {
				it( "should iterate over all properties, including those inherited from prototypes.", function() {
					function Original() {
						this.a = "a"
						this.b = "b"
					}
					Original.prototype.c = "c"
					var original = Original.create()
					var clone = {}
					
					original.forEachProperty( function( key, property ) {
						clone[ key ] = property
					} )
					
					expect( clone ).toEqual( {
						a: "a",
						b: "b",
						c: "c"
					} )
				} )
				
				it( "should return everything that's returned by the anonymous function.", function() {
					var o = { a: "x", b: "y" }
					
					var properties = o.forEachProperty( function( key, property ) { return property } )
					
					expect( properties[ 0 ] ).toEqual( "x" )
					expect( properties[ 1 ] ).toEqual( "y" )
				} )
			} )
			
			
			
			describe( "Function.prototype.create", function() {
				it( "should act like new.", function() {
					var a = "a"
					var b = "b"
					function Constructor( a ) {
						this.a = a
					}
					Constructor.prototype.b = b
					
					var o = Constructor.create( a )
					
					expect( o.a ).toEqual( a )
					expect( o.b ).toEqual( b )
				} )
				
				it( "should return the object that the constructor returns, if it returns one.", function() {
					var anObject = { x: "x" }
					function Constructor() {
						return anObject
					}
					
					var o = Constructor.create()
					
					expect( o ).toEqual( anObject )
				} )
			} )
			
			describe( "Function.prototype.extend", function() {
				it( "should add an instance from the extended constructor as prototype.", function() {
					var parentWasCalled = false
					function Parent() {
						this.method = function() {
							parentWasCalled = true
						}
					}
					
					var Child = Parent.extend( function() {
						// ...
					} )
					var o = Child.create()
					o.method()
					
					expect( parentWasCalled ).toEqual( true )
				} )
				
				it( "should provide access to overridden methods.", function() {
					var childWasCalled  = false
					var parentWasCalled = false
					function Parent() {}
					Parent.prototype.method = function() {
						parentWasCalled = true
					}
					
					var Child = Parent.extend( function() {
						// ...
					} )
					Child.addMethod( "method", function() {
						childWasCalled = true
						this.parent( "method" )()
					} )
					var o = Child.create()
					o.method()
					
					expect( childWasCalled ).toEqual( true )
					expect( parentWasCalled ).toEqual( true )
				} )
				
				it( "should call an overridden method with the correct this reference.", function() {
					var thisObject
					function Parent() {}
					Parent.prototype.method = function() {
						thisObject = this
					}
					
					var Child = Parent.extend( function() {} )
					Child.addMethod( "method", function() {
						this.parent( "method" )()
					} )
					var child = Child.create()
					child.method()
					
					expect( thisObject ).toEqual( child )
				} )
			} )
			
			
			
			describe( "Function.prototype.addMethod", function() {
				it( "should add a method to the prototype.", function() {
					var didStuff = false;
					
					function Constructor() {}
					Constructor.addMethod( "doStuff", function() { didStuff = true } );
					
					var c = new Constructor();
					c.doStuff();
					
					expect( didStuff ).toEqual( true );
				} )
			} );
			
			describe( "Function.prototype.addToPrototype", function() {
				it( "should add methods to the prototype.", function() {
					var fDidStuff = false;
					var gDidStuff = false;
					
					function Constructor() {}
					Constructor.addToPrototype( {
						f: function() { fDidStuff = true },
						g: function() { gDidStuff = true }
					} );
					
					var c = new Constructor();
					c.f();
					c.g();
					
					expect( fDidStuff ).toEqual( true );
					expect( gDidStuff ).toEqual( true );
				} )
			} );
			
			describe( "Function.prototype.curry", function() {
				var add = function( a, b ) {
					return a + b;
				}
				
				var addFive = add.curry( 5 );
				
				expect( addFive( 10 ) ).toEqual( 15 );
			} );
			
			describe( "Function.prototype.bind", function() {
				it( "should be implemented on all platforms.", function() {
					var object = {
						x: 5,
						getX: function() { return this.x }
					}
					
					var boundGetX = object.getX.bind( object )
					
					expect( boundGetX() ).toEqual( object.x )
				} )
			} )
			
			
			
			describe( "Array.fromArguments", function() {
				it( "should convert from an arguments array-like object to an array.", function() {
					var f = function() {
						return Array.fromArguments( arguments )
					}
					
					var array = f( 0, 1, 2 )
					
					array.forEach( function( element, index ) {
						expect( element ).toEqual( index )
					} )
				} )
			} )
			
			describe( "Array.prototype.contains", function() {
				it( "should return whether an element is contained in an array.", function() {
					var arrayA = [ 1, 2, 3 ]
					var arrayB = [ 1, 2, 4 ]
					
					expect( arrayA.contains( 3 ) ).toEqual( true )
					expect( arrayB.contains( 3 ) ).toEqual( false )
				} )
			} )
			
			describe( "Array.prototype.hasEqualElementsAs", function() {
				it( "should return true, if the arrays have equal arguments.", function() {
					var arrayA = [ 1, 2, 3 ]
					var arrayB = [ 1, 2, 3 ]
					
					expect( arrayA.hasEqualElementsAs( arrayB ) ).toEqual( true )
				} )
				
				it( "should return false, if the arrays have un-equal arguments.", function() {
					var arrayA = [ 1, 2, 3 ]
					var arrayB = [ 1, 5, 3 ]
					
					expect( arrayA.hasEqualElementsAs( arrayB ) ).toEqual( false )
				} )
			} )
			
			describe( "Array.prototype.forEach.", function() {
				it( "should be implemented on all platforms.", function() {
					var sourceArray = [ 1, 2, 3 ]
					
					var elements = []
					var indices  = []
					var arrays   = []
					
					sourceArray.forEach( function( element, index, array ) {
						elements.push( element )
						indices.push( index )
						arrays.push( array )
					} )
					
					expect( elements ).toEqual( sourceArray )
					expect( indices ).toEqual( [ 0, 1, 2 ] )
					expect( arrays ).toEqual( [ sourceArray, sourceArray, sourceArray ] )
				} )
				
				it( "should not call the function if the element is undefined.", function() {
					var array = []
					array[ 2 ] = "x"
					
					var numberOfCalls = 0
					array.forEach( function() {
						numberOfCalls += 1
					} )
					
					expect( numberOfCalls ).toEqual( 1 )
				} )
			} )
			
			describe( "Array.prototype.map", function() {
				it( "should be implemented on all platforms.", function() {
					var sourceArray = [ 1, 2, 3 ]
					
					var indices        = []
					var arrays         = []
					
					var mappedElements = sourceArray.map( function( element, index, array ) {
						indices.push( index )
						arrays.push( array )
						return element * 2
					} )
					
					expect( mappedElements ).toEqual( [ 2, 4, 6 ] )
					expect( indices ).toEqual( [ 0, 1, 2 ] )
					expect( arrays ).toEqual( [ sourceArray, sourceArray, sourceArray ] )
				} )
			} )
			
			describe( "Array.prototype.some", function() {
				it( "should be implemented on all platforms.", function() {
					var sourceArrayA = [ 1, 2, 3 ]
					var sourceArrayB = [ 2, 3, 4 ]
					
					var elements = []
					var indices  = []
					var arrays   = []
					
					var aHasFour = sourceArrayA.some( function( element, index, array ) {
						elements.push( element )
						indices.push( index )
						arrays.push( array )
						
						return element === 4
					} )
					var bHasFour = sourceArrayB.some( function( element ) {
						return element === 4
					} )
					
					expect( aHasFour ).toEqual( false )
					expect( bHasFour ).toEqual( true )
					expect( elements ).toEqual( sourceArrayA )
					expect( indices ).toEqual( [ 0, 1, 2 ] )
					expect( arrays ).toEqual( [ sourceArrayA, sourceArrayA, sourceArrayA ] )
				} )
				
				it( "should not call the function if the element is undefined.", function() {
					var array = []
					array[ 2 ] = "x"
					
					var numberOfCalls = 0
					array.some( function() {
						numberOfCalls += 1
					} )
					
					expect( numberOfCalls ).toEqual( 1 )
				} )
			} )
			
			describe( "Array.prototype.filter", function() {
				it( "should be implemented on all platforms.", function() {
					var sourceArray = [ 1, 2, 3 ]
					
					var elements = []
					var indices  = []
					var arrays   = []
					
					var filteredArray = sourceArray.filter( function( element, index, array ) {
						elements.push( element )
						indices.push( index )
						arrays.push( array )
						
						return element !== 2
					} )
					
					expect( filteredArray ).toEqual( [ 1, 3 ] )
					expect( elements ).toEqual( sourceArray )
					expect( indices ).toEqual( [ 0, 1, 2 ] )
					expect( arrays ).toEqual( [ sourceArray, sourceArray, sourceArray ] )
				} )
				
				it( "should not call the function if the element is undefined.", function() {
					var array = []
					array[ 2 ] = "x"
					
					var numberOfCalls = 0
					array.filter( function() {
						numberOfCalls += 1
					} )
					
					expect( numberOfCalls ).toEqual( 1 )
				} )
			} )
			
			
			
			describe( "Number.prototype.timesDo", function() {
				it( "should execute the code as many times.", function() {
					var numberOfExecutions = 0;
					(3).timesDo( function() {
						numberOfExecutions += 1;
					} );
					
					expect( numberOfExecutions ).toEqual( 3 );
				} );
				
				it( "should provide the current execution number as a parameter and return the results from the function.", function() {
					var result = (3).timesDo( function( i ) {
						return i
					} )
					
					expect( result ).toEqual( [ 0, 1, 2 ] )
				} );
			} );
		} );
	}
);

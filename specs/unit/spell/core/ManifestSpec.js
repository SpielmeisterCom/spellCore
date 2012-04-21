
define(
	[
		"spell/core/Manifest"
	],
	function(
		Manifest
	) {
		"use strict";

		
		describe( "Manifest", function() {
			it( "should create a manifest with non-entity arguments.", function() {
				var manifest = Manifest.create()
					.pushArgument( "passedTimeInSeconds" )
					.pushArgument( "createEntity" )
					.pushArgument( "destroyEntity" )
				
				expect( manifest.arguments[ 0 ] ).toEqual( { type: "passedTimeInSeconds" } )
				expect( manifest.arguments[ 1 ] ).toEqual( { type: "createEntity" } )
				expect( manifest.arguments[ 2 ] ).toEqual( { type: "destroyEntity" } )
			} )
			
			it( "should create a manifest with entity arguments.", function() {
				var manifest = Manifest.create()
					.pushArgument( "entities" ).withComponents( "a", "b" )
					.pushArgument( "entities" ).withComponents( "x", "y" ) // make sure calls can be chained
				
				expect( manifest.arguments[ 0 ] ).toEqual( { type: "entities", componentTypes: [ "a", "b" ] } )
				expect( manifest.arguments[ 1 ] ).toEqual( { type: "entities", componentTypes: [ "x", "y" ] } )
			} )
			
			it( "should provide an alias for withComponents, for situations where only a single component type is requested.", function() {
				var manifest = Manifest.create()
					.pushArgument( "entities" ).withComponent( "a" )
					.pushArgument( "entities" ).withComponent( "x" ) // make sure calls can be chained
				
				expect( manifest.arguments[ 0 ] ).toEqual( { type: "entities", componentTypes: [ "a" ] } )
				expect( manifest.arguments[ 1 ] ).toEqual( { type: "entities", componentTypes: [ "x" ] } )
			} )
			
			it( "should create a manifest with entity arguments in a custom data structure.", function() {
				function MyDataStructure() {}
				var argumentA = "a"
				var argumentB = "b"
				var manifest = Manifest.create()
					.pushArgument( "entities" ).withComponents( "a", "b" ).inDataStructure( MyDataStructure, [ argumentA ] )
					.pushArgument( "entities" ).withComponents( "x", "y" ).inDataStructure( MyDataStructure, [ argumentB ] ) // make sure calls can be chained
				
				expect( manifest.arguments[ 0 ].dataStructure ).toEqual( { constructor: MyDataStructure, constructorArguments: [ argumentA ] } )
				expect( manifest.arguments[ 1 ].dataStructure ).toEqual( { constructor: MyDataStructure, constructorArguments: [ argumentB ] } )
			} )
			
			describe( "robustness", function() {
				it( "should throw an exception, if an invalid argument type is passed.", function() {
					var invalidArgument = "invalidArgument"
					
					var caughtException
					try {
						Manifest.create()
							.pushArgument( invalidArgument )
					}
					catch ( exception ) {
						caughtException = exception
					}
					
					expect( caughtException ).toContain( Manifest.INVALID_ARGUMENT_ERROR )
					expect( caughtException ).toContain( invalidArgument )
				} )
				
				it( "should throw an exception, if withComponents is called with a non-entity argument.", function() {
					var caughtExceptionA
					try {
						Manifest.create()
							.pushArgument( "passedTimeInSeconds" ).withComponents( "a", "b" )
					}
					catch( exception ) {
						caughtExceptionA = exception
					}
					var caughtExceptionB
					try {
						Manifest.create()
							.pushArgument( "createEntity" ).withComponents( "a", "b" )
					}
					catch( exception ) {
						caughtExceptionB = exception
					}
					var caughtExceptionC
					try {
						Manifest.create()
							.pushArgument( "destroyEntity" ).withComponents( "a", "b" )
					}
					catch( exception ) {
						caughtExceptionC = exception
					}
					
					expect( caughtExceptionA ).toContain( Manifest.INVALID_WITH_COMPONENTS_CALL )
					expect( caughtExceptionB ).toContain( Manifest.INVALID_WITH_COMPONENTS_CALL )
					expect( caughtExceptionC ).toContain( Manifest.INVALID_WITH_COMPONENTS_CALL )
				} )
				
				it( "should throw an exception, if inDataStructure is called with non-entity argument.", function() {
					function MyDataStructure() {}
					var caughtExceptionA
					try {
						Manifest.create()
							.pushArgument( "passedTimeInSeconds" ).inDataStructure( MyDataStructure, [ "argument" ] )
					}
					catch( exception ) {
						caughtExceptionA = exception
					}
					var caughtExceptionB
					try {
						Manifest.create()
							.pushArgument( "createEntity" ).inDataStructure( MyDataStructure, [ "argument" ] )
					}
					catch( exception ) {
						caughtExceptionB = exception
					}
					var caughtExceptionC
					try {
						Manifest.create()
							.pushArgument( "destroyEntity" ).inDataStructure( MyDataStructure, [ "argument" ] )
					}
					catch( exception ) {
						caughtExceptionC = exception
					}
					
					expect( caughtExceptionA ).toContain( Manifest.INVALID_IN_DATA_STRUCTURE_CALL )
					expect( caughtExceptionB ).toContain( Manifest.INVALID_IN_DATA_STRUCTURE_CALL )
					expect( caughtExceptionC ).toContain( Manifest.INVALID_IN_DATA_STRUCTURE_CALL )
				} )
			} )
		} )
	}
)
